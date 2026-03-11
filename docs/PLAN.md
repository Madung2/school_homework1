# 서울 따릉이 대여소 대시보드 웹 서비스 계획

## 1. 공공 데이터 선정 및 활용 방식

**선정 데이터**: 서울시 공공자전거 따릉이 대여소 정보  
**출처**: [서울 열린데이터광장](https://data.seoul.go.kr/dataList/OA-13252/F/1/datasetView.do) (OA-13252)

- **제공 형태**: File (Excel/CSV). Open API는 해당 데이터셋 기준 **종료** 상태이므로 **파일 기반**으로 진행.
- **갱신 주기**: 반기(6개월). 최신 파일: "공공자전거 대여소 정보(25.12월 기준).xlsx".
- **포함 정보**: 대여소명, 관리번호, 위치정보(위경도), 거치대 수.
- **라이선스**: 공공누리 1유형(출처 표시, 상업적 이용·변경 가능).

**구현 방안**: 열린데이터광장에서 CSV/Excel 파일을 다운로드 후 `src/data/stations.json`으로 변환해 포함. 대시보드에서는 해당 JSON을 API를 통해 제공하고 테이블로 시각화.

## 2. 계정·서비스 준비

| 항목 | 내용 |
|------|------|
| **GitHub** | github.com 가입, 레포지토리 생성 후 프로젝트 푸시 |
| **Vercel** | vercel.com 가입 → GitHub 연동 → Import Project |
| **Turso** | turso.tech 가입 → DB 생성 → URL + Auth Token 발급 |
| **Google OAuth** | Google Cloud Console에서 OAuth 2.0 클라이언트 ID 생성, 리디렉션 URI에 Vercel URL 추가 |

## 3. 기술 스택 및 디렉터리 구조

- **프레임워크**: Next.js (App Router)
- **인증**: NextAuth.js — Google Provider
- **DB**: Turso (libSQL) — 허용 회원(allow list) 저장
- **배포**: Vercel (Git push 시 자동 배포)

주요 경로: `src/app` (페이지·API), `src/lib` (Turso·Auth), `src/data/stations.json`, `scripts/` (스키마·시드), `docs/` (문서).

## 4. 회원 관리 및 접근 허용 리스트

- **Turso 테이블**: `allowed_members (id, email, created_at)`
- **초기 데이터**: `kts123@kookmin.ac.kr` 시드 스크립트로 INSERT
- **흐름**: Google OAuth 로그인 → 세션 이메일로 Turso에서 허용 여부 조회 → 미등록 시 403/리다이렉트, 등록 시 대시보드 허용

## 5. 공공 데이터 연동 및 대시보드

- **데이터**: 따릉이 대여소 CSV/Excel → JSON 변환 후 `src/data/stations.json` 저장
- **API**: `GET /api/stations` — 세션·허용 리스트 확인 후 JSON 반환
- **대시보드**: 테이블(대여소명, 관리번호, 주소, 거치대 수, 위경도 등)

## 6. 배포 및 환경 변수

- **Vercel**: GitHub 연동 후 push 시 자동 빌드·배포
- **환경 변수**: `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`

## 7. 문서화

- 프로젝트 소개·기술 스택·공공 데이터 출처·실행 방법·허용 리스트 관리: README.md 및 docs/PLAN.md에 md로 작성 후 Git 커밋.

## 8. 참고 링크

- [서울 열린데이터광장 - 따릉이 대여소 정보](https://data.seoul.go.kr/dataList/OA-13252/F/1/datasetView.do)
- [Turso + Next.js 가이드](https://docs.turso.tech/sdk/ts/guides/nextjs)
- [NextAuth.js](https://next-auth.js.org/)
