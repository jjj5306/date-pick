# 구현 계획 01

## 목표

데이트봇 MVP의 첫 구현 단위는 Slack Socket Mode 기반 봇 런타임과 핵심 모듈 경계를 세우고, 추천 요청과 기록 저장 미리보기의 최소 vertical slice를 테스트 가능한 형태로 만든다.

이 계획은 실제 외부 API 연동을 한 번에 완성하기보다, Slack 입력에서 workflow를 거쳐 Notion/OpenAI/SQLite 경계까지 이어지는 실행 구조를 먼저 만든다. Notion과 OpenAI는 adapter 경계를 실제 SDK 기반으로 준비하되, 테스트에서는 mock으로 검증한다.

## 전제

- 언어: TypeScript
- 런타임: Node.js 20 LTS 이상
- 패키지 매니저: npm
- Slack framework: `@slack/bolt`
- Notion client: `@notionhq/client`
- OpenAI client: `openai`
- 테스트: Vitest
- SQLite: Oracle VM 로컬 파일 기반 저장소
- 실행 방식: Slack Socket Mode
- 배포 대상: Oracle Cloud Always Free VM

## 작업 범위

### 포함

- TypeScript 프로젝트 스캐폴딩
- 환경 변수 로딩과 설정 검증
- Slack Socket Mode 앱 초기화
- `/date-recommend`, `/date-note` 명령 라우팅
- 추천 요청 workflow 골격
- 기록 요청 workflow 골격
- Notion schema mapping과 adapter interface
- OpenAI adapter interface와 JSON 응답 검증 경계
- Weather adapter mock
- SQLite 기반 `PendingWrite` 저장소
- 단위 테스트와 mock 기반 workflow 테스트
- `.env.example`, README 실행 섹션, progress 문서 업데이트

### 제외

- Oracle VM 실제 provisioning
- Slack App 생성과 권한 설정 자동화
- Notion integration 실제 권한 연결 자동화
- OpenAI 모델별 품질 튜닝
- 실제 날씨 API provider 연동
- 공개 HTTPS endpoint
- `/date-plan` 구현. 이 기능은 Issue #2에서 별도 구현한다.
- 장기 대화 원문 저장

## 내부 작업

### 1. 프로젝트 스캐폴딩

생성 또는 수정 파일:

- `package.json`
- `package-lock.json`
- `tsconfig.json`
- `vitest.config.ts`
- `.gitignore`
- `.env.example`
- `src/index.ts`
- `src/config/env.ts`
- `src/config/logger.ts`

작업:

- `npm` 기반 TypeScript 프로젝트를 초기화한다.
- `build`, `dev`, `start`, `test`, `typecheck`, `lint` 스크립트를 정의한다.
- 환경 변수는 `src/config/env.ts`에서 한 번만 읽고 검증한다.
- 필수 환경 변수:
  - `SLACK_BOT_TOKEN`
  - `SLACK_APP_TOKEN`
  - `SLACK_SIGNING_SECRET`
  - `NOTION_TOKEN`
  - `OPENAI_API_KEY`
  - `NOTION_DATE_DATA_SOURCE_ID`
  - `NOTION_ANNIVERSARY_DATA_SOURCE_ID`
  - `SQLITE_PATH`
  - `OPENAI_MODEL`

### 2. 도메인 모델 정의

생성 파일:

- `src/domain/dateItem.ts`
- `src/domain/anniversary.ts`
- `src/domain/recommendation.ts`
- `src/domain/pendingWrite.ts`
- `src/domain/workflow.ts`

주요 타입:

- `DateItem`
- `Anniversary`
- `RecommendationCandidate`
- `RecommendationResult`
- `StructuredDateLog`
- `PendingWrite`
- `WorkflowContext`

원칙:

- Notion property 이름은 adapter 내부에서만 사용한다.
- domain 타입은 영어 필드만 사용한다.
- Slack user/channel 정보는 workflow context에만 둔다.

### 3. Slack Interface 구현

생성 파일:

- `src/slack/app.ts`
- `src/slack/routes.ts`
- `src/slack/messages.ts`
- `src/slack/interactions.ts`

작업:

- `@slack/bolt`의 Socket Mode 앱을 초기화한다.
- `/date-recommend` 명령을 추천 workflow에 연결한다.
- `/date-note` 명령을 기록 저장 workflow에 연결한다.
- 기존 `/date` 명령은 등록하지 않는다. Slack App에 남아 있다면 제거하거나 사용하지 않는다.
- Slack command payload의 `command`와 `text`를 workflow context로 전달한다.
- command별 handler가 분리되어 있으므로 텍스트 기반 intent 분류는 두지 않는다.
- 추천 결과는 Slack block message로 반환한다.
- 기록 저장 후보는 저장, 수정, 취소 버튼을 포함한 미리보기로 반환한다.
- 저장 버튼 interaction은 `PendingWrite`를 조회한 뒤 Notion 저장 workflow를 호출한다.

### 4. Notion Adapter 구현

생성 파일:

- `src/adapters/notion/notionClient.ts`
- `src/adapters/notion/notionMapper.ts`
- `src/adapters/notion/notionRepository.ts`
- `src/adapters/notion/notionTypes.ts`

작업:

- `데이트` database를 조회해 `DateItem[]`으로 변환한다.
- `기념일` database를 조회해 `Anniversary[]`로 변환한다.
- 승인된 `StructuredDateLog`를 Notion page 생성 payload로 변환한다.
- 한국어 Notion property와 domain field mapping을 mapper에 격리한다.
- formula와 relation property는 MVP에서 읽기 전용으로 둔다.

테스트 포인트:

- Notion property 누락 시 명확한 mapping 오류를 반환한다.
- 비용, 날짜, select/status 값 변환을 검증한다.
- Notion API 응답 mock을 domain 타입으로 변환한다.

### 5. OpenAI Adapter 구현

생성 파일:

- `src/adapters/openai/openaiClient.ts`
- `src/adapters/openai/openaiPrompts.ts`
- `src/adapters/openai/openaiSchemas.ts`

작업:

- 추천 설명 생성 함수 `generateRecommendationResponse`를 만든다.
- 자연어 기록 구조화 함수 `extractDateLog`를 만든다.
- OpenAI 응답은 JSON schema 검증 후 workflow에 전달한다.
- OpenAI가 날짜를 비운 경우 `오늘`, `어제`, `그제`, `M월 D일` 같은 한국어 날짜 표현은 현재 날짜 기준으로 보정한다.
- 요청 context는 필요한 Notion 요약과 사용자 입력으로 제한한다.
- token 사용량을 log context에 남길 수 있게 한다.

테스트 포인트:

- 정상 JSON 응답을 domain 타입으로 변환한다.
- JSON validation 실패 시 재시도 가능한 오류로 변환한다.
- 한국어 상대 날짜와 월/일 표현이 `YYYY-MM-DD`로 보정된다.
- prompt builder가 전체 Notion 원문을 그대로 넣지 않고 compact context만 넣는지 확인한다.

### 6. Recommendation Engine 구현

생성 파일:

- `src/engines/recommendation/scoring.ts`
- `src/engines/recommendation/contextBuilder.ts`
- `src/engines/recommendation/recommendationEngine.ts`

작업:

- Notion 후보와 완료 기록을 분리한다.
- 최근 완료 항목과 같은 분류는 감점한다.
- 우선순위, 예상 비용, 날짜 조건, 날씨 힌트를 점수에 반영한다.
- 상위 3개 후보를 OpenAI adapter에 넘길 compact context로 변환한다.
- 추천 후보가 부족하면 확인 필요 메시지를 포함한다.

테스트 포인트:

- 완료 항목은 추천 후보에서 제외된다.
- 같은 분류 반복은 감점된다.
- 최대 3개의 후보만 반환된다.
- 근거가 부족한 항목은 `needs_user_check`로 표시된다.

### 7. Log Extraction Workflow 구현

생성 파일:

- `src/workflows/logWorkflow.ts`
- `src/workflows/recommendationWorkflow.ts`
- `src/workflows/saveWorkflow.ts`

작업:

- 기록 요청은 OpenAI adapter로 구조화한다.
- 구조화 결과를 Slack 미리보기로 보여준다.
- 승인 전 payload와 원 `/date-note ...` 요청을 `PendingWrite`로 저장한다.
- 저장 버튼을 누르면 `PendingWrite`를 조회하고 Notion 저장을 실행한다.
- 저장 완료 후 Slack에 원 요청, 저장 요약, Notion page URL을 반환한다.

테스트 포인트:

- 기록 요청이 `PendingWrite`로 저장된다.
- 만료된 `PendingWrite`는 저장되지 않는다.
- 저장 성공 시 원 요청, 저장 요약, Notion URL이 Slack 응답에 포함된다.

### 8. SQLite PendingWrite Store 구현

생성 파일:

- `src/storage/sqlite.ts`
- `src/storage/pendingWriteStore.ts`
- `src/storage/migrations/001_create_pending_writes.sql`

schema:

```sql
create table if not exists pending_writes (
  id text primary key,
  user_id text not null,
  channel_id text not null,
  action text not null,
  payload_json text not null,
  expires_at text not null,
  created_at text not null
);
```

작업:

- 앱 시작 시 migration을 적용한다.
- `create`, `findById`, `deleteById`, `deleteExpired` 함수를 제공한다.
- 기본 만료 시간은 30분으로 둔다.

테스트 포인트:

- pending write 생성과 조회
- 원 요청 보존
- 만료 데이터 삭제
- 저장 후 삭제

### 9. Weather Adapter 준비

생성 파일:

- `src/adapters/weather/weatherAdapter.ts`
- `src/adapters/weather/mockWeatherAdapter.ts`

작업:

- 실제 provider가 정해지기 전까지 mock adapter를 사용한다.
- adapter 응답은 `available`, `condition`, `indoorOutdoorHint`, `needsUserCheck` 형태로 고정한다.
- API 실패 또는 provider 미설정 시 추천 workflow는 중단하지 않는다.

## 파일 계획

```text
src/
  index.ts
  config/
    env.ts
    logger.ts
  slack/
    app.ts
    routes.ts
    messages.ts
    interactions.ts
  domain/
    dateItem.ts
    anniversary.ts
    recommendation.ts
    pendingWrite.ts
    workflow.ts
  workflows/
    recommendationWorkflow.ts
    logWorkflow.ts
    saveWorkflow.ts
  engines/
    recommendation/
      scoring.ts
      contextBuilder.ts
      recommendationEngine.ts
  adapters/
    notion/
      notionClient.ts
      notionMapper.ts
      notionRepository.ts
      notionTypes.ts
    openai/
      openaiClient.ts
      openaiPrompts.ts
      openaiSchemas.ts
    weather/
      weatherAdapter.ts
      mockWeatherAdapter.ts
  storage/
    sqlite.ts
    pendingWriteStore.ts
    migrations/
      001_create_pending_writes.sql
tests/
  unit/
  integration/
```

## 테스트 계획

- 단위 테스트는 `tests/unit/<src와 같은 경로>/<파일명>.test.ts` 구조를 따른다.
- 통합 테스트는 `tests/integration/workflows/<workflow 파일명>.test.ts` 구조를 따른다.
- 외부 API adapter 테스트는 실제 네트워크를 호출하지 않고 mock client로 요청 payload를 검증한다.
- `tests/unit/config/env.test.ts`: 필수 환경 변수 검증
- `tests/unit/adapters/notion/notionClient.test.ts`: Notion `databases.query`, `pages.create` 호출 payload 검증
- `tests/unit/adapters/notion/notionMapper.test.ts`: Notion property mapping 검증
- `tests/unit/adapters/openai/openaiClient.test.ts`: OpenAI chat completions 호출 payload 검증. 실제 OpenAI API는 호출하지 않는다.
- `tests/unit/adapters/openai/openaiSchemas.test.ts`: JSON validation 검증
- `tests/unit/engines/recommendation/scoring.test.ts`: 추천 점수화 검증
- `tests/unit/engines/recommendation/contextBuilder.test.ts`: OpenAI compact context 검증
- `tests/unit/storage/pendingWriteStore.test.ts`: SQLite 저장소 검증
- `tests/unit/slack/routes.test.ts`: `/date-recommend`, `/date-note` 명령별 workflow 라우팅 검증
- `tests/unit/slack/interactions.test.ts`: 저장, 취소, 수정 안내 interaction 검증
- `tests/integration/workflows/recommendationWorkflow.test.ts`: Notion, Weather, OpenAI mock 기반 추천 workflow 검증
- `tests/integration/workflows/logWorkflow.test.ts`: 자연어 기록 구조화와 pending write 생성 검증
- `tests/integration/workflows/saveWorkflow.test.ts`: 승인 후 Notion 저장 검증
- `tests/smoke/notionEnv.test.ts`: 실제 `.env`의 Notion token과 database ID 조회 검증. OpenAI API는 호출하지 않는다.

## 검증 명령

```powershell
npm install
npm run typecheck
npm test
npm run test:smoke:notion
npm run build
```

외부 연동 smoke test는 실제 token과 Slack App 설정이 준비된 뒤 실행한다.

```powershell
Copy-Item -LiteralPath .env.example -Destination .env
npm run test:smoke:notion
npm run dev
```

## 문서 업데이트

- `README.md`에 로컬 실행 방법, 필수 환경 변수, Slack Slash Commands `/date-recommend`와 `/date-note` 설정을 추가한다.
- `docs/001-데이트봇-mvp/progress.md`의 다음 작업을 실제 token 기반 Socket Mode smoke test 준비로 갱신한다.
- `docs/001-데이트봇-mvp/changelog.md`에 명령 체계 변경 이력을 기록한다.
- OpenAI 모델, 날씨 provider, Oracle VM 자동 재시작 방식이 확정되면 `architecture.md` 또는 후속 구현계획에 반영한다.

## 위험과 대응

- Slack App 권한, Slash Commands, Interactivity, Socket Mode 설정이 누락되면 로컬 smoke test가 막힌다.
  - 대응: `.env.example`과 README에 필요한 token 종류와 `/date-recommend`, `/date-note` 설정을 명확히 적는다.
- Notion property 이름이 변경되면 mapper가 실패한다.
  - 대응: mapper 테스트와 명확한 오류 메시지를 둔다.
- OpenAI JSON 응답이 schema를 벗어날 수 있다.
  - 대응: validation 실패를 사용자 재시도 메시지로 변환한다.
- SQLite native dependency가 Oracle VM에서 설치 실패할 수 있다.
  - 대응: 구현 중 선택한 SQLite package의 Oracle Linux 설치 조건을 확인하고 README에 기록한다.
- 날씨 provider가 미정이다.
  - 대응: mock adapter로 workflow를 먼저 완성하고 provider 확정 후 `implementation-plan-02.md`에서 실제 연동한다.

## 완료 조건

- TypeScript 프로젝트가 빌드된다.
- `/date-recommend` 입력이 추천 workflow로 라우팅된다.
- `/date-note` 입력이 기록 workflow로 라우팅된다.
- 추천 workflow가 mock 기반으로 최대 3개 추천 결과를 만든다.
- 기록 workflow가 저장 미리보기를 만들고 `PendingWrite`에 저장한다.
- 승인 workflow가 mock Notion 저장까지 실행된다.
- Notion/OpenAI/Weather adapter가 interface로 분리되어 있다.
- `npm run typecheck`, `npm test`, `npm run build`가 통과한다.
- README와 progress 문서가 구현 상태에 맞게 갱신된다.

## 구현 결과 메모

- 1차 구현은 TypeScript Slack Bot 골격, workflow, adapter 경계, `PendingWrite` 저장소, mock 기반 테스트까지 완료했다.
- SQLite 저장소는 Windows와 Oracle VM 양쪽에서 native dependency 부담을 줄이기 위해 `sql.js` 기반 파일 저장으로 구현했다.
- Notion SDK는 현재 lockfile의 `@notionhq/client@2.3.0`에 맞춰 `databases.query`와 `pages.create`의 `database_id` 경계를 사용한다.
- 실제 Slack/Notion/OpenAI token 기반 Socket Mode smoke test는 아직 수행하지 않았다.
- `/date` 단일 명령 대신 `/date-recommend`, `/date-note`로 나누는 문서와 코드 라우팅 변경이 반영되었다.
- 테스트 파일은 `src` 경로를 반영하는 구조로 재배치했고, Notion/OpenAI adapter의 외부 API 호출 payload는 mock client 단위 테스트로 검증한다.
- Notion smoke test는 `.env`의 database ID와 integration 공유 상태를 실제 Notion 조회로 검증한다.
- Slack 저장 완료 응답은 원 요청과 저장 요약을 함께 표시한다.
