'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Loader2, X, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface DocumentUploaderProps {
  onUploadComplete: (data: any) => void;
}

export function DocumentUploader({ onUploadComplete }: DocumentUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [instruction, setInstruction] = useState('');
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp'],
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    multiple: false,
  });

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: '파일을 선택해주세요',
        description: '이미지 또는 PDF 파일을 업로드해주세요.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('instruction', instruction);

      const response = await fetch('/api/document/parse', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('문서 처리 실패');
      }

      const data = await response.json();

      if (data.tables && data.tables.length > 0) {
        toast({
          title: '성공',
          description: `${data.tables.length}개의 표를 찾았습니다.`,
        });
        onUploadComplete(data);
      } else {
        toast({
          title: '표를 찾을 수 없음',
          description: '문서에서 표를 찾을 수 없습니다. 다른 문서를 시도해보세요.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: '오류',
        description: '문서 처리 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            transition-colors duration-200
            ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-gray-400'}
            ${selectedFile ? 'bg-gray-50' : ''}
          `}
        >
          <input {...getInputProps()} />
          
          {selectedFile ? (
            <div className="space-y-2">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <p className="text-sm font-medium">{selectedFile.name}</p>
              <p className="text-xs text-gray-500">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  clearFile();
                }}
              >
                <X className="h-4 w-4 mr-1" />
                파일 제거
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              {isDragActive ? (
                <p className="text-sm">파일을 여기에 놓으세요...</p>
              ) : (
                <>
                  <p className="text-sm">
                    이미지나 PDF를 드래그하거나 클릭하여 업로드
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, JPEG, PDF 지원 (최대 10MB)
                  </p>
                </>
              )}
            </div>
          )}
        </div>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="settings">
            <AccordionTrigger>
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                고급 설정 (선택사항)
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 pt-2">
                <div>
                  <Label htmlFor="instruction">데이터 형식 지시사항</Label>
                  <Textarea
                    id="instruction"
                    placeholder="예시:
열 1: 정수
열 2: 소수점 2자리
열 3: 퍼센트
열 4: 통화(원)

또는 특별한 지시사항을 입력하세요."
                    value={instruction}
                    onChange={(e) => setInstruction(e.target.value)}
                    className="mt-2 h-32 font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    💡 팁: 〃 같은 반복 기호는 자동으로 위 셀 값으로 대체됩니다.
                  </p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {selectedFile && (
          <Button
            onClick={handleUpload}
            disabled={isUploading}
            className="w-full"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                처리 중...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                문서 분석 시작
              </>
            )}
          </Button>
        )}
      </div>
    </Card>
  );
}