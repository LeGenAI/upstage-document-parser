'use client';

import { useState } from 'react';
import { DocumentUploader } from '@/components/document-uploader';
import { TableViewer } from '@/components/table-viewer';
import { FileText, Table, ArrowRight } from 'lucide-react';

export default function Home() {
  const [extractedData, setExtractedData] = useState<any>(null);

  const handleUploadComplete = (data: any) => {
    setExtractedData(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">문서 표 추출기</h1>
                <p className="text-sm text-gray-600">이미지와 PDF에서 표를 자동으로 추출하여 엑셀로 복사</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* How it works */}
        <div className="mb-8 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">사용 방법</h2>
          <div className="flex items-center justify-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold">
                1
              </div>
              <span>문서 업로드</span>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400" />
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold">
                2
              </div>
              <span>자동 표 추출</span>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400" />
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold">
                3
              </div>
              <span>엑셀로 복사</span>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="mb-8">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              문서 업로드
            </h2>
            <DocumentUploader onUploadComplete={handleUploadComplete} />
            
            {/* Features */}
            <div className="mt-6 bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">지원 기능</h3>
              <ul className="space-y-1 text-sm text-blue-700">
                <li>✓ 이미지 파일 (PNG, JPG, JPEG)</li>
                <li>✓ PDF 문서</li>
                <li>✓ 한국어 문서 지원</li>
                <li>✓ 복잡한 표 구조 인식</li>
                <li>✓ 엑셀 호환 형식으로 변환</li>
                <li>✓ 〃 같은 반복 기호 자동 처리</li>
                <li>✓ 데이터 타입별 자동 포맷팅</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Results Section - Full Width */}
        {extractedData?.tables && extractedData.tables.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Table className="h-5 w-5" />
              추출된 표
            </h2>
            <TableViewer tables={extractedData.tables} />
          </div>
        )}

        {/* Tips */}
        <div className="mt-8 bg-amber-50 border border-amber-200 rounded-lg p-4 max-w-4xl mx-auto">
          <h3 className="font-semibold text-amber-900 mb-2">💡 사용 팁</h3>
          <ul className="space-y-1 text-sm text-amber-700">
            <li>• 선명한 이미지일수록 더 정확한 결과를 얻을 수 있습니다.</li>
            <li>• 표가 여러 개인 경우, 각 표를 개별적으로 복사할 수 있습니다.</li>
            <li>• 복사한 데이터는 엑셀에서 바로 붙여넣기(Ctrl+V)하면 자동으로 셀에 배치됩니다.</li>
            <li>• CSV 다운로드 옵션을 사용하면 파일로 저장할 수 있습니다.</li>
            <li>• 고급 설정에서 각 열의 데이터 타입을 지정할 수 있습니다.</li>
            <li>• 〃, ″, 々 같은 반복 기호는 자동으로 위 셀의 값으로 대체됩니다.</li>
          </ul>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 bg-gray-900 text-white py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">
            Powered by Upstage Document AI | © 2025 Document Parser
          </p>
        </div>
      </footer>
    </div>
  );
}