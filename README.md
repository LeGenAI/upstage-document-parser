# 📊 Upstage Document Parser

이미지와 PDF에서 표를 자동으로 추출하여 엑셀로 복사할 수 있는 웹 애플리케이션

## ✨ 주요 기능

- 📷 **이미지/PDF 업로드**: 드래그 앤 드롭 또는 클릭으로 간편하게 업로드
- 🔍 **자동 표 추출**: Upstage Document AI를 활용한 정확한 표 감지
- 📋 **엑셀 호환 복사**: 탭으로 구분된 데이터를 클립보드에 복사
- 💾 **CSV 다운로드**: 추출된 표를 CSV 파일로 저장
- 🔄 **반복 기호 처리**: 〃, ″ 등의 반복 기호를 자동으로 위 셀 값으로 대체
- 🎯 **데이터 타입 포맷팅**: 정수, 소수점, 퍼센트, 통화 등 자동 포맷팅

## 🚀 시작하기

### 사전 요구사항

- Node.js 18.x 이상
- Upstage API 키 ([https://console.upstage.ai](https://console.upstage.ai)에서 발급)

### 설치

```bash
# 저장소 클론
git clone https://github.com/LeGenAI/upstage-document-parser.git
cd upstage-document-parser

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env.local
# .env.local 파일을 열어 UPSTAGE_API_KEY 설정
```

### 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

### 프로덕션 빌드

```bash
npm run build
npm run start
```

## 🚢 Railway 배포

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/ZhN5Ov?referralCode=YOUR_CODE)

또는 수동 배포:

1. [Railway](https://railway.app)에 로그인
2. New Project → Deploy from GitHub repo 선택
3. 이 저장소 선택
4. 환경 변수 설정:
   - `UPSTAGE_API_KEY`: Upstage API 키

## 📖 사용 방법

1. **문서 업로드**: 표가 포함된 이미지나 PDF 파일을 업로드
2. **고급 설정** (선택사항): 데이터 형식 지시사항 입력
   ```
   열 1: 정수
   열 2: 소수점 2자리
   열 3: 퍼센트
   열 4: 통화(원)
   ```
3. **문서 분석**: "문서 분석 시작" 버튼 클릭
4. **결과 확인**: 추출된 표 확인
5. **엑셀로 복사**: "엑셀에 복사" 버튼 클릭 후 엑셀에 붙여넣기

## 🛠️ 기술 스택

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI**: Tailwind CSS, shadcn/ui
- **API**: Upstage Document AI
- **Deployment**: Railway

## 📝 라이센스

MIT License

## 🤝 기여하기

풀 리퀘스트를 환영합니다! 큰 변경사항의 경우 먼저 이슈를 열어 논의해 주세요.

## 📧 문의

문제가 있거나 제안사항이 있으시면 [이슈](https://github.com/LeGenAI/upstage-document-parser/issues)를 열어주세요.