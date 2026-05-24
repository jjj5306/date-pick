# Issue 001: 데이트봇 MVP 실행 구조

## 상태

Accepted

## 요구사항 요약

데이트봇 MVP는 Slack에서 데이트 추천과 기록 요청을 받고, Notion `데이트 아카이브`를 지식베이스와 저장소로 사용한다. AI 기능은 OpenAI API로 구현한다. 서버 운영비는 Oracle Cloud Always Free VM 기반 실행으로 최소화한다.

## 배경

MVP는 Slack 안에서 데이트 추천 요청, 자연어 기록 요청, 저장 승인까지 처리한다. 이를 구현하려면 Slack 이벤트와 interaction을 받을 실행 환경, Notion `데이트 아카이브`를 읽고 쓰는 지식베이스 경계, OpenAI API를 호출하는 AI 경계, 승인 전 기록 후보를 보관하는 짧은 수명 상태 저장소가 먼저 정해져야 한다.

이번 결정의 범위는 MVP를 실제로 실행할 수 있는 최소 운영 구조다. 따라서 사용자 경험 자체보다 운영 제약을 우선한다. 봇은 개인 PC 상태에 의존하지 않고 상시 응답할 수 있어야 하며, 서버 월 고정비는 사실상 0원에 가까워야 한다. 또한 MVP 단계에서는 공개 HTTPS endpoint 운영에 필요한 도메인, TLS, reverse proxy, 방화벽 설정을 최소화한다.

장기 데이터의 기준 저장소는 Notion이다. 애플리케이션 내부 저장소는 Slack interaction의 승인 대기 상태와 최소 운영 상태에 한정한다. AI provider는 MVP 품질을 위해 OpenAI API를 사용하되, 후속 비용 최적화나 provider 교체 가능성을 막지 않도록 호출 경계를 분리해야 한다.

## 결정

- 실행 환경은 Oracle Cloud Always Free VM을 기본값으로 한다.
- Slack 연결은 Socket Mode를 기본값으로 한다.
- AI provider는 OpenAI API를 사용한다.
- 지식베이스와 장기 저장소는 Notion `데이트 아카이브`를 사용한다.
- 저장 승인 대기 상태인 `PendingWrite`와 최소 운영 상태는 Oracle VM 로컬 SQLite에 저장한다.
- Notion 쓰기 작업은 Slack interaction을 통한 승인 후 수행한다.
- Oracle Autonomous Database는 MVP에서 사용하지 않고 후속 확장 후보로 둔다.
- OpenAI API 호출부는 adapter로 분리해 모델 변경과 비용 통제를 가능하게 한다.

## 대안

### 로컬 PC 실행

개발과 디버깅은 쉽지만 PC 전원, 절전, Windows 업데이트, 터미널 종료에 따라 Slack 응답성이 끊길 수 있다. 상시 구동이 필요한 MVP 기본 실행 환경으로는 적합하지 않다.

### 공개 HTTPS endpoint

Slack 요청을 직접 받을 수 있지만 도메인, TLS, reverse proxy, 방화벽, ingress 설정이 필요하다. Socket Mode는 공개 endpoint 없이 WebSocket 연결로 Slack 요청과 interaction을 받을 수 있어 초기 운영 구성이 단순하다.

### Oracle Autonomous Database

Free Tier에서 사용할 수 있지만 MVP의 장기 데이터는 Notion에 저장된다. 애플리케이션 내부 상태는 `PendingWrite`와 최소 운영 상태에 한정되므로 SQLite로 충분하다.

### 대체 AI provider

무료 또는 로컬 모델을 사용할 수 있지만 추천 품질, 구조화 출력 안정성, 운영 복잡도를 별도로 검증해야 한다. MVP에서는 OpenAI API를 기본 provider로 두고, 호출부를 adapter로 분리해 향후 교체 가능성을 유지한다.

## 영향

- Oracle Always Free VM 생성 가능 여부와 idle reclaim 가능성을 운영 준비 단계에서 확인해야 한다.
- Socket Mode 사용을 위해 Slack app-level token 관리가 필요하다.
- SQLite 파일 백업과 마이그레이션 전략이 필요하다.
- OpenAI API 키 관리와 호출량 관측이 필요하다.
- Slack App/Bot과 Notion integration 권한 범위를 최소화해야 한다.

## 관련 이슈

- GitHub Issue: https://github.com/jjj5306/date-pick/issues/1
- Issue 001 로컬 문서: `docs/001-데이트봇-mvp/`
- 지식베이스: https://jun-n.notion.site/2f32d61b14f080fb8c1dc2fa1d620fa9?source=copy_link
