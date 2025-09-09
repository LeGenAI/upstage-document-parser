import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const instruction = formData.get('instruction') as string || '';
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Prepare form data for Upstage API
    const upstageFormData = new FormData();
    upstageFormData.append('document', file);
    upstageFormData.append('ocr', 'true');

    // Call Upstage Layout Analysis API
    const response = await fetch('https://api.upstage.ai/v1/document-ai/layout-analysis', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.UPSTAGE_API_KEY}`,
      },
      body: upstageFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Upstage API error:', errorText);
      return NextResponse.json(
        { error: 'Failed to process document' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Extract tables from the layout analysis response
    const tables = extractTables(data, instruction);
    
    return NextResponse.json({
      success: true,
      tables,
      rawData: data,
    });
  } catch (error) {
    console.error('Document processing error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function extractTables(layoutData: any, instruction: string): any[] {
  const tables: any[] = [];
  
  // Check if elements exist in the response
  if (!layoutData.elements) {
    return tables;
  }

  // Filter for table elements
  for (const element of layoutData.elements) {
    if (element.category === 'table') {
      // Extract table HTML if available
      const tableData = {
        id: element.id || Math.random().toString(36).substr(2, 9),
        html: element.html || '',
        text: element.text || '',
        bbox: element.bounding_box || null,
        page: element.page || 1,
      };
      
      // Parse HTML table to structured data if HTML is available
      if (tableData.html) {
        tableData.parsedData = parseHTMLTable(tableData.html);
        // Apply post-processing to fix common OCR issues
        tableData.parsedData = postProcessTableData(tableData.parsedData, instruction);
      }
      
      tables.push(tableData);
    }
  }

  return tables;
}

function parseHTMLTable(html: string): any[][] {
  // Simple HTML table parser to extract cell data
  const rows: any[][] = [];
  
  // Remove unnecessary whitespace and newlines
  const cleanHtml = html.replace(/\n/g, '').replace(/\s+/g, ' ');
  
  // Extract rows
  const rowMatches = cleanHtml.match(/<tr[^>]*>(.*?)<\/tr>/gi) || [];
  
  for (const rowHtml of rowMatches) {
    const row: string[] = [];
    
    // Extract cells (both th and td)
    const cellMatches = rowHtml.match(/<(th|td)[^>]*>(.*?)<\/(th|td)>/gi) || [];
    
    for (const cellHtml of cellMatches) {
      // Extract text content from cell
      const cellText = cellHtml
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .trim();
      row.push(cellText);
    }
    
    if (row.length > 0) {
      rows.push(row);
    }
  }
  
  return rows;
}

function postProcessTableData(data: any[][], instruction: string): any[][] {
  const processedData = [...data];
  
  // Fix ditto marks (〃, '', ", ″, 々)
  for (let i = 1; i < processedData.length; i++) {
    for (let j = 0; j < processedData[i].length; j++) {
      const cell = processedData[i][j];
      
      // Check for various ditto marks
      if (typeof cell === 'string') {
        // Common ditto marks and their variations
        const dittoMarks = ['〃', '″', '々', "''", '""', ',,', '..', '--'];
        const isDittoMark = dittoMarks.some(mark => 
          cell === mark || cell.trim() === mark
        );
        
        // If it's a ditto mark, copy from the cell above
        if (isDittoMark && i > 0 && processedData[i-1][j]) {
          processedData[i][j] = processedData[i-1][j];
        }
        
        // Clean up common OCR mistakes
        let cleanedCell = cell;
        
        // Remove zero-width spaces and other invisible characters
        cleanedCell = cleanedCell.replace(/[\u200B-\u200D\uFEFF]/g, '');
        
        // Fix common number formatting issues
        if (instruction.includes('number') || instruction.includes('숫자')) {
          // Fix decimal points (convert full-width to half-width)
          cleanedCell = cleanedCell.replace(/．/g, '.');
          cleanedCell = cleanedCell.replace(/，/g, ',');
          
          // Remove spaces in numbers
          if (/^[\d\s,.-]+$/.test(cleanedCell)) {
            cleanedCell = cleanedCell.replace(/\s/g, '');
          }
        }
        
        // Fix boolean values
        if (instruction.includes('boolean') || instruction.includes('불리언')) {
          const lowerCell = cleanedCell.toLowerCase();
          if (lowerCell === 'true' || lowerCell === '참' || lowerCell === 'yes' || lowerCell === '예') {
            cleanedCell = 'true';
          } else if (lowerCell === 'false' || lowerCell === '거짓' || lowerCell === 'no' || lowerCell === '아니오') {
            cleanedCell = 'false';
          }
        }
        
        processedData[i][j] = cleanedCell;
      }
    }
  }
  
  // Apply column-specific formatting based on instruction
  if (instruction) {
    const lines = instruction.split('\n');
    for (const line of lines) {
      // Parse column instructions like "column 1: integer" or "열 1: 정수"
      const colMatch = line.match(/(?:column|열)\s*(\d+):\s*(.+)/i);
      if (colMatch) {
        const colIndex = parseInt(colMatch[1]) - 1;
        const dataType = colMatch[2].toLowerCase();
        
        for (let i = 1; i < processedData.length; i++) {
          if (processedData[i][colIndex] !== undefined) {
            processedData[i][colIndex] = formatByDataType(
              processedData[i][colIndex],
              dataType
            );
          }
        }
      }
    }
  }
  
  return processedData;
}

function formatByDataType(value: string, dataType: string): string {
  if (!value || value.trim() === '') return value;
  
  const cleanValue = value.trim();
  
  if (dataType.includes('integer') || dataType.includes('정수')) {
    // Remove non-numeric characters and parse as integer
    const numStr = cleanValue.replace(/[^\d-]/g, '');
    const num = parseInt(numStr);
    return isNaN(num) ? cleanValue : num.toString();
  }
  
  if (dataType.includes('decimal') || dataType.includes('소수')) {
    // Extract decimal places if specified
    const decimalMatch = dataType.match(/(\d+)/);
    const decimalPlaces = decimalMatch ? parseInt(decimalMatch[1]) : 2;
    
    // Parse as float and format
    const numStr = cleanValue.replace(/[^\d.-]/g, '');
    const num = parseFloat(numStr);
    return isNaN(num) ? cleanValue : num.toFixed(decimalPlaces);
  }
  
  if (dataType.includes('percentage') || dataType.includes('퍼센트')) {
    // Handle percentage formatting
    let numStr = cleanValue.replace(/[^\d.-]/g, '');
    const num = parseFloat(numStr);
    if (!isNaN(num)) {
      return cleanValue.includes('%') ? `${num}%` : `${num}%`;
    }
  }
  
  if (dataType.includes('currency') || dataType.includes('통화') || dataType.includes('원')) {
    // Format as currency
    const numStr = cleanValue.replace(/[^\d.-]/g, '');
    const num = parseInt(numStr);
    if (!isNaN(num)) {
      return num.toLocaleString('ko-KR');
    }
  }
  
  return cleanValue;
}