# 따릉이 대여소 대시보드

서울시 공공자전거 **따릉이** 대여소 정보를 조회할 수 있는 대시보드 웹 서비스입니다.  
접근 허용 리스트에 등록된 사용자만 Google 로그인 후 이용할 수 있습니다.

## 기술 스택

- **프레임워크**: Next.js (App Router)
- **인증**: NextAuth.js + Google OAuth
- **DB**: Turso (libSQL) — 접근 허용 회원 저장
- **배포**: Vercel (Git push 시 자동 배포)
- **스타일**: Tailwind CSS

## 공공 데이터 출처

- **데이터**: 서울시 공공자전거 따릉이 대여소 정보  
- **제공**: [서울 열린데이터광장](https://data.seoul.go.kr/dataList/OA-13252/F/1/datasetView.do) (OA-13252)  
- **라이선스**: 공공누리 1유형(출처 표시, 상업적 이용·변경 가능)  
- **갱신**: 반기(6개월). 최신 파일을 다운로드 후 `src/data/stations.json`을 교체하면 됩니다.

## 로컬 실행

1. 저장소 클론 후 의존성 설치  
   ```bash
   npm install
   ```

2. 환경 변수 설정  
   `.env` 또는 `.env.local`에 다음 값을 채웁니다.  
   - `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`: [Turso](https://turso.tech)에서 DB 생성 후 발급  
   - `NEXTAUTH_URL`: 로컬은 `http://localhost:3000`  
   - `NEXTAUTH_SECRET`: 임의의 안전한 랜덤 문자열  
   - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`: [Google Cloud Console](https://console.cloud.google.com) OAuth 2.0 클라이언트 ID

3. Turso 테이블 및 시드  
   - Turso 대시보드 또는 CLI에서 `scripts/schema.sql` 실행  
   - 허용 이메일 추가: `npm run db:seed` (기본값: `kts123@kookmin.ac.kr`)

4. 개발 서버 실행  
   ```bash
   npm run dev
   ```  
   브라우저에서 http://localhost:3000 접속 후 Google 로그인 → 대시보드에서 따릉이 대여소 목록 확인.

## 허용 리스트 관리

- 허용 회원 데이터는 **Turso**의 `allowed_members` 테이블에 저장됩니다.  
- 초기 시드: `npm run db:seed` 실행 시 `kts123@kookmin.ac.kr`가 추가됩니다.  
- 추가/삭제는 Turso 대시보드 또는 CLI로 `INSERT`/`DELETE` 하면 됩니다.

## 배포 (Vercel)

1. [Vercel](https://vercel.com)에 GitHub 연동 후 이 레포를 Import Project로 연결합니다.  
2. 프로젝트 설정에서 환경 변수에 다음을 등록합니다.  
   - `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`  
   - `NEXTAUTH_URL`: Vercel 배포 URL (예: `https://프로젝트명.vercel.app`)  
   - `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`  
3. Google OAuth 승인된 리디렉션 URI에 `https://프로젝트명.vercel.app/api/auth/callback/google`를 추가합니다.  
4. 이후 `git push` 시 자동으로 빌드·배포됩니다.

## 문서

- [계획서 및 상세 설계](docs/PLAN.md)
- [따릉이 데이터 업데이트 방법](docs/DATA.md)

## 라이선스

공공 데이터는 공공누리 1유형을 따릅니다. 본 프로젝트 코드는 MIT 등 원하는 라이선스로 사용 가능합니다.

