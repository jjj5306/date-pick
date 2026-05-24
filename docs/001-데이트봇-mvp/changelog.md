# 변경 이력

## 2026-05-24: Slack 명령 체계 분리

- MVP 기본 명령에서 `/date` 단일 command를 제외했다.
- 추천 요청은 `/date-recommend`, 기록 요청은 `/date-note`를 사용한다.
- `/date-plan`은 Issue #2에서 별도 구현하는 범위로 분리했다.
- Slack App 설정에서 Slash Commands에 `/date-recommend`, `/date-note`를 각각 추가해야 한다.
- 기존 `/date` command는 제거하거나 사용하지 않는다.
- 저장/수정/취소 버튼 처리를 위해 Interactivity는 계속 필요하며, Slack 연결 방식은 Socket Mode를 계속 사용한다.

## 2026-05-24: 테스트 구조와 adapter API 호출 검증 보강

- 단위 테스트 파일을 `tests/unit/<src와 같은 경로>/<파일명>.test.ts` 구조로 재배치했다.
- workflow 통합 테스트는 `tests/integration/workflows/<파일명>.test.ts` 구조로 정리했다.
- Notion adapter는 `databases.query`, `pages.create` 호출 payload를 mock client로 검증한다.
- OpenAI adapter는 실제 유료 API를 호출하지 않고 chat completions 요청 payload와 JSON 응답 파싱을 mock client로 검증한다.

## 2026-05-24: Notion 환경 smoke test 추가

- `.env`의 `NOTION_TOKEN`, `NOTION_DATE_DATA_SOURCE_ID`, `NOTION_ANNIVERSARY_DATA_SOURCE_ID`로 실제 Notion database를 읽을 수 있는지 확인하는 `npm run test:smoke:notion` 명령을 추가했다.
- 이 smoke test는 OpenAI API를 호출하지 않는다.
- 기본 `npm test`는 외부 네트워크와 개인 `.env`에 의존하지 않도록 unit/integration mock 테스트만 실행한다.
- Notion database ID 환경 변수는 전체 URL이나 view query가 아닌 ID 형식만 허용하도록 검증한다.
