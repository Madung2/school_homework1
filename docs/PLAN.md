# 기상청 초단기실황·예보 대시보드 웹 서비스 계획

## 1. 공공 데이터 선정 및 활용 방식

**선정 데이터**: 기상청_단기예보(구 동네예보) 조회서비스 — 초단기실황·초단기예보  
**출처**: [공공데이터포털](https://www.data.go.kr/) (기상청 API)

- **제공 형태**: Open API (REST, JSON). 실시간 호출.
- **엔드포인트**:
  - 초단기실황: `GET .../VilageFcstInfoService_2.0/getUltraSrtNcst`
  - 초단기예보: `GET .../VilageFcstInfoService_2.0/getUltraSrtFcst`
- **발표 시각**: 초단기실황 매시 정시(HH00), 초단기예보 매시 30분(HH30). 매시각 10분 이후 해당 시각 자료 이용 가능.
- **격자 좌표**: nx, ny (기상청 격자계). 기본값 서울 기준 nx=60, ny=127.

**구현 방안**: 서버 API 라우트(`GET /api/weather`)에서 세션·허용 리스트 확인 후 기상청 두 API를 호출해 실황·예보를 합쳐 반환. 대시보드에서 테이블로 시각화.

## 2. 계정·서비스 준비

| 항목 | 내용 |
|------|------|
| **GitHub** | github.com 가입, 레포지토리 생성 후 프로젝트 푸시 |
| **Vercel** | vercel.com 가입 → GitHub 연동 → Import Project |
| **Turso** | turso.tech 가입 → DB 생성 → URL + Auth Token 발급 |
| **Google OAuth** | Google Cloud Console에서 OAuth 2.0 클라이언트 ID 생성, 리디렉션 URI에 Vercel URL 추가 |
| **공공데이터포털** | 가입 후 기상청_단기예보 조회서비스 활용 신청 → 인증키 발급 |

## 3. 기술 스택 및 디렉터리 구조

- **프레임워크**: Next.js (App Router)
- **인증**: NextAuth.js — Google Provider
- **DB**: Turso (libSQL) — 허용 회원(allow list) 저장
- **배포**: Vercel (Git push 시 자동 배포)

주요 경로: `src/app` (페이지·API), `src/lib` (Turso·Auth·weather), `scripts/` (스키마·시드), `docs/` (문서).

## 4. 회원 관리 및 접근 허용 리스트

- **Turso 테이블**: `allowed_members (id, email, created_at)`
- **초기 데이터**: `kts123@kookmin.ac.kr` 시드 스크립트로 INSERT
- **흐름**: Google OAuth 로그인 → 세션 이메일로 Turso에서 허용 여부 조회 → 미등록 시 403/리다이렉트, 등록 시 대시보드 허용

## 5. 공공 데이터 연동 및 대시보드

- **API**: `GET /api/weather` — 세션·허용 리스트 확인 후 기상청 getUltraSrtNcst·getUltraSrtFcst 호출, `{ realtime, forecast }` JSON 반환
- **대시보드**: 초단기실황(기온, 강수, 풍속 등) 테이블, 초단기예보(시간대별 기온·하늘·강수형태) 테이블

## 6. 배포 및 환경 변수

- **Vercel**: GitHub 연동 후 push 시 자동 빌드·배포
- **환경 변수**: `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `WEATHER_API_SERVICE_KEY`

## 7. 문서화

- 프로젝트 소개·기술 스택·공공 데이터 출처·실행 방법·허용 리스트 관리: README.md 및 docs/PLAN.md, docs/DATA.md에 작성 후 Git 커밋.

## 8. 참고 링크

- [공공데이터포털 - 기상청_단기예보 조회서비스](https://www.data.go.kr/tcs/dss/selectApiDataDetailView.do?publicDataPk=15084084)
- [Turso + Next.js 가이드](https://docs.turso.tech/sdk/ts/guides/nextjs)
- [NextAuth.js](https://next-auth.js.org/)
