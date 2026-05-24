# date-pick

date-pick은 연인과의 데이트 기록과 앞으로 가보고 싶은 장소를 Notion에 정리해 개인 지식베이스로 만들고, Slack을 통해 데이트를 기록하거나 다음 데이트를 추천받는 개인용 데이트 관리 AI 시스템입니다.

주말에 다녀온 데이트를 Slack에서 자연어로 남기면 date-pick은 날짜, 장소, 활동, 비용, 만족도, 메모를 정리해 Notion에 저장합니다. 이렇게 쌓인 실제 데이트 기록과 미리 정리해 둔 가고 싶은 곳 목록을 바탕으로, 다음 데이트 후보를 더 개인화해서 추천합니다.

추천 시에는 단순히 저장된 장소만 보여주는 것이 아니라 영화 상영 정보, 맛집 후보, 축제와 전시 같은 이벤트 정보, 날씨, 최근 데이트 패턴, 예산, 이동 편의성 등을 함께 고려합니다. 목표는 "이번 주말 뭐 하지?"라는 질문에 두 사람이 좋아할 만한 현실적인 데이트 코스를 빠르게 제안하는 것입니다.

## 작업 방식

이 프로젝트의 Codex 기반 바이브 코딩 흐름은 [VIBE_CODING_WORKFLOW.md](VIBE_CODING_WORKFLOW.md)에 정리되어 있습니다.

## 로컬 실행

Node.js 20 LTS 이상과 npm이 필요합니다.

```powershell
npm install
Copy-Item -LiteralPath .env.example -Destination .env
npm run typecheck
npm test
npm run build
npm run dev
```

Slack App은 Socket Mode를 켜고 `/date` slash command와 버튼 interaction을 받을 수 있게 설정해야 합니다. 실제 Slack, Notion, OpenAI 호출은 `.env`에 토큰을 넣은 뒤 실행합니다.

## 환경 변수

`.env.example`을 복사해 다음 값을 채웁니다. 토큰과 API 키는 코드에 넣지 않습니다.

- `SLACK_BOT_TOKEN`
- `SLACK_APP_TOKEN`
- `SLACK_SIGNING_SECRET`
- `NOTION_TOKEN`
- `OPENAI_API_KEY`
- `NOTION_DATE_DATA_SOURCE_ID`
- `NOTION_ANNIVERSARY_DATA_SOURCE_ID`
- `SQLITE_PATH`
- `OPENAI_MODEL`
- `OPENAI_MONTHLY_BUDGET_KRW`
