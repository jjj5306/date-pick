# 변경 이력

## 2026-05-24: OpenAI 추천 JSON 응답 요청 보정

- `/date-recommend`에서 `response_format: json_object`를 사용할 때 OpenAI 메시지에 `json` 지시가 포함되도록 추천 프롬프트를 보정했다.
- OpenAI adapter 단위 테스트에서 추천/기록 요청 메시지가 `json_object` 계약을 만족하는지 검증한다.
- 추천 프롬프트에 응답 schema와 Notion source URL 포함 규칙을 명시하고, 흔한 응답 별칭은 파서에서 정상화한다.
- OpenAI 응답 검증 실패 시 raw 응답 대신 schema path 중심의 오류만 남기도록 했다.

## 2026-05-24: Slack 처리 중 표시 추가

- `/date-recommend`, `/date-note` 명령을 받으면 먼저 공개 처리 중 메시지를 표시한다.
- OpenAI/Notion 처리가 끝나면 처리 중 메시지를 최종 추천 결과, 기록 미리보기, 또는 오류 메시지로 교체한다.
- 사용자가 긴 요청 처리 중에도 봇이 정상적으로 작업 중임을 확인할 수 있도록 했다.

## 2026-05-24: 기록 날짜 보정 강화

- OpenAI 기록 구조화 prompt에 Asia/Seoul 기준 날짜와 상대 날짜 해석 규칙을 포함했다.
- OpenAI가 날짜를 비우거나 `오늘`, `어제`, `M월 D일` 같은 표현을 그대로 반환해도 코드에서 ISO 날짜로 보정한다.

## 2026-05-24: Slack 응답 공개와 원 요청 보존

- 추천 결과와 기록 미리보기 성공 응답은 `in_channel`로 보내 채널에 공개한다.
- 기록 저장 대기 상태에 원래 `/date-note ...` 요청을 함께 저장한다.
- 저장 버튼 성공 후 원래 미리보기 메시지를 저장 완료 메시지로 교체하고, 원 요청과 저장 요약, Notion 링크를 함께 표시한다.

## 2026-05-24: Notion 환경 smoke test 추가

- `.env`의 `NOTION_TOKEN`, `NOTION_DATE_DATA_SOURCE_ID`, `NOTION_ANNIVERSARY_DATA_SOURCE_ID`로 실제 Notion database를 읽을 수 있는지 확인하는 `npm run test:smoke:notion` 명령을 추가했다.
- smoke test는 OpenAI API를 호출하지 않는다.
- 기본 `npm test`는 외부 네트워크와 개인 `.env`에 의존하지 않도록 unit/integration mock 테스트만 실행한다.
- Notion database ID 환경 변수는 전체 URL이나 view query가 아닌 ID 형식만 허용하도록 검증한다.

## 2026-05-24: 테스트 구조와 adapter API 호출 검증 보강

- 단위 테스트 파일을 `tests/unit/<src와 같은 경로>/<파일명>.test.ts` 구조로 재배치했다.
- workflow 통합 테스트는 `tests/integration/workflows/<파일명>.test.ts` 구조로 정리했다.
- Notion adapter의 `databases.query`, `pages.create` 호출 payload를 mock client로 검증한다.
- OpenAI adapter는 실제 유료 API를 호출하지 않고 chat completions 요청 payload와 JSON 응답 파싱을 mock client로 검증한다.

## 2026-05-24: Slack 명령 체계 분리

- MVP 기본 명령에서 `/date` 단일 command를 제외했다.
- 추천 요청은 `/date-recommend`, 기록 요청은 `/date-note`를 사용한다.
- `/date-plan`은 Issue #2에서 별도 구현하는 범위로 분리했다.
- Slack App 설정에서 Slash Commands에 `/date-recommend`, `/date-note`를 각각 추가해야 한다.
- 기존 `/date` command는 제거하거나 사용하지 않는다.
- 저장/수정/취소 버튼 처리를 위해 Interactivity는 계속 필요하며, Slack 연결 방식은 Socket Mode를 유지한다.
