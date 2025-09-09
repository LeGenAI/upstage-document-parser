'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Download, CheckCircle2, Table } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TableViewerProps {
  tables: any[];
}

export function TableViewer({ tables }: TableViewerProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const { toast } = useToast();

  const copyTableToClipboard = async (table: any, index: number) => {
    try {
      let textToCopy = '';
      
      if (table.parsedData && table.parsedData.length > 0) {
        // Convert parsed data to tab-separated values for Excel
        textToCopy = table.parsedData
          .map((row: string[]) => row.join('\t'))
          .join('\n');
      } else if (table.text) {
        // Fallback to raw text if parsed data is not available
        textToCopy = table.text;
      }

      if (!textToCopy) {
        toast({
          title: '복사할 데이터 없음',
          description: '표에서 복사할 수 있는 데이터를 찾을 수 없습니다.',
          variant: 'destructive',
        });
        return;
      }

      await navigator.clipboard.writeText(textToCopy);
      
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
      
      toast({
        title: '복사 완료',
        description: '표 데이터가 클립보드에 복사되었습니다. 엑셀에 붙여넣기 하세요.',
      });
    } catch (error) {
      console.error('Copy error:', error);
      toast({
        title: '복사 실패',
        description: '클립보드에 복사하는 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    }
  };

  const downloadAsCSV = (table: any, index: number) => {
    try {
      let csvContent = '';
      
      if (table.parsedData && table.parsedData.length > 0) {
        // Convert parsed data to CSV
        csvContent = table.parsedData
          .map((row: string[]) => 
            row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')
          )
          .join('\n');
      } else {
        toast({
          title: '다운로드 실패',
          description: 'CSV로 변환할 수 있는 데이터가 없습니다.',
          variant: 'destructive',
        });
        return;
      }

      // Create BOM for Excel to recognize UTF-8
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `table_${index + 1}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: '다운로드 완료',
        description: 'CSV 파일이 다운로드되었습니다.',
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: '다운로드 실패',
        description: 'CSV 파일 생성 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    }
  };

  if (!tables || tables.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center text-gray-500">
          <Table className="mx-auto h-12 w-12 mb-4 text-gray-300" />
          <p>아직 추출된 표가 없습니다.</p>
          <p className="text-sm mt-2">문서를 업로드하여 표를 추출하세요.</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {tables.map((table, index) => (
        <Card key={table.id || index}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Table className="h-5 w-5" />
                표 {index + 1}
                {table.page && <span className="text-sm text-gray-500">(페이지 {table.page})</span>}
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyTableToClipboard(table, index)}
                >
                  {copiedIndex === index ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                      복사됨
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      엑셀에 복사
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => downloadAsCSV(table, index)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  CSV 다운로드
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {table.parsedData && table.parsedData.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <tbody>
                    {table.parsedData.map((row: string[], rowIndex: number) => (
                      <tr key={rowIndex} className={rowIndex === 0 ? 'bg-gray-50 font-semibold' : ''}>
                        {row.map((cell: string, cellIndex: number) => (
                          <td
                            key={cellIndex}
                            className="border border-gray-300 px-3 py-2 text-sm"
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : table.html ? (
              <div className="overflow-x-auto">
                <div dangerouslySetInnerHTML={{ __html: table.html }} />
              </div>
            ) : (
              <div className="text-gray-500 text-sm">
                <pre className="whitespace-pre-wrap">{table.text || '표 데이터를 표시할 수 없습니다.'}</pre>
              </div>
            )}
            
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                💡 <strong>사용 방법:</strong> "엑셀에 복사" 버튼을 클릭한 후 엑셀에서 Ctrl+V (Windows) 또는 Cmd+V (Mac)으로 붙여넣기하세요.
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}