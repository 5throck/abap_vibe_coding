# SAP ABAP를 위한 Harness Engineering

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Contributing](https://img.shields.io/badge/기여-환영합니다-brightgreen.svg)](CONTRIBUTING.md)

## 프로젝트 미션

이 프로젝트는 Harness Engineering의 **핵심 참조 구현체(Reference Implementation)**입니다. 강력한 **Harness Engineering** 프레임워크를 구축하여 SAP ABAP 개발 방식을 혁신하는 것을 목표로 합니다. AI 에이전트를 활용해 비즈니스 요구사항 분석부터 시스템 배포까지 전체 개발 라이프사이클을 자동화, 표준화, 최적화합니다.

## Harness Engineering 개념

**Harness Engineering**은 전문화된 AI 에이전트들이 엄격하게 구조화된 "하네스(환경)" 내에서 협업하는 방법론입니다. 이 접근 방식은 AI 기반 개발이 예측 가능하고, 전문적이며, 고도로 효율적으로 이루어지도록 보장합니다.

주요 원칙:
- **문서 우선 접근법**: 모든 아키텍처 결정, 워크플로우, 비즈니스 규칙은 코드 작성 전에 문서화됩니다.
- **역할 기반 협업**: PM, 분석가, 개발자, 아키텍트 등 전문 에이전트에게 작업이 위임되며, 인간 소프트웨어 엔지니어링 팀처럼 통합 거버넌스 모델 하에 운영됩니다.
- **저장소를 두뇌로**: ABAP 소스 코드는 SAP 시스템 내에 직접 존재하지만, 이 저장소는 AI 에이전트가 SAP 환경을 관리하는 데 사용하는 **지능, 로직, 아키텍처 프레임워크**(하네스)를 추적합니다.

## 시스템 아키텍처 및 운영 원칙

이 시스템은 현대적인 AI 인터페이스와 SAP 환경 사이의 브리지 역할을 합니다:

1. **에이전트 계층**: AI 에이전트(Claude Code CLI, Antigravity, Gemini CLI)가 사전 정의된 Harness 역할에 따라 작업을 조율하는 "두뇌" 역할을 합니다.
2. **프로토콜 계층**: MCP(Model Context Protocol)와 같은 표준화된 프로토콜을 사용하여 SAP ADT(ABAP 개발 도구) 기능을 에이전트에게 안전하게 노출합니다.
3. **SAP 계층**: REST API와 WebSocket을 통해 SAP 시스템과 직접 상호작용하며, 디버깅, 쿼리 실행, 객체 관리 등 상태 기반 작업을 수행합니다.

## 에이전트 프레임워크 (AGENTS.md)

AI 에이전트는 **PM 주도 거버넌스** 모델 하에 두 가지 전략 그룹으로 운영됩니다:

- **🏢 비즈니스 그룹**: PM과 모듈 분석가(SD, MM, FI 등)로 구성되며, 비즈니스 요구사항을 기술 요구사항으로 전환합니다.
- **🛠️ 기술 그룹**: 아키텍트, 개발자, DBA, QA, 전문가(Fiori, Forms, GUI, 인터페이스)로 구성되며, 솔루션을 구현하고 검증합니다.

역할, 트리거 키워드, 핸드오프 프로토콜에 대한 자세한 내용은 [AGENTS.md](AGENTS.md)를 참조하세요.

## 핵심 문서

| 파일 | 목적 |
| :--- | :--- |
| **[AGENTS.md](AGENTS.md)** | 역할, 협업 워크플로우, 서브에이전트 디스패치 프로토콜 |
| **[docs/context.md](docs/context.md)** | **공유** 프로젝트 컨텍스트: 빌드 명령어, 코드베이스 맵, 개발 규칙 |
| **[skills/abap-dev/SKILL.md](skills/abap-dev/SKILL.md)** | 전문 AI 스킬(BAPI 탐색기, 메모리 인텔리전스) 및 QA 체인 |
| **[docs/setup-guide.md](docs/setup-guide.md)** | 단계별 환경 설정(MCP, SAP, abapGit) |
| **[memory/MEMORY.md](memory/MEMORY.md)** | 개발 이력 및 아키텍처 결정 인덱스 |

## 운영 워크플로우

이 프로젝트는 표준화된 **6단계 Harness Engineering 워크플로우**를 따릅니다:
1. **트리아지 & 리서치** → 2. **비즈니스 분석** → 3. **거버넌스 승인** → 4. **기술 설계** → 5. **구현 & 검증** → 6. **최종화**

상세한 실행 순서는 [AGENTS.md § 협업 워크플로우](AGENTS.md#agent-coordination-workflow-harness-advanced)를 참조하세요.

# SAP ABAP를 위한 Harness Engineering

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Contributing](https://img.shields.io/badge/기여-환영합니다-brightgreen.svg)](CONTRIBUTING.md)

## 프로젝트 미션

이 프로젝트는 Harness Engineering의 **핵심 참조 구현체(Reference Implementation)**입니다. 강력한 **Harness Engineering** 프레임워크를 구축하여 SAP ABAP 개발 방식을 혁신하는 것을 목표로 합니다. AI 에이전트를 활용해 비즈니스 요구사항 분석부터 시스템 배포까지 전체 개발 라이프사이클을 자동화, 표준화, 최적화합니다.

## Harness Engineering 개념

**Harness Engineering**은 전문화된 AI 에이전트들이 엄격하게 구조화된 "하네스(환경)" 내에서 협업하는 방법론입니다. 이 접근 방식은 AI 기반 개발이 예측 가능하고, 전문적이며, 고도로 효율적으로 이루어지도록 보장합니다.

주요 원칙:
- **문서 우선 접근법**: 모든 아키텍처 결정, 워크플로우, 비즈니스 규칙은 코드 작성 전에 문서화됩니다.
- **역할 기반 협업**: PM, 분석가, 개발자, 아키텍트 등 전문 에이전트에게 작업이 위임되며, 인간 소프트웨어 엔지니어링 팀처럼 통합 거버넌스 모델 하에 운영됩니다.
- **저장소를 두뇌로**: ABAP 소스 코드는 SAP 시스템 내에 직접 존재하지만, 이 저장소는 AI 에이전트가 SAP 환경을 관리하는 데 사용하는 **지능, 로직, 아키텍처 프레임워크**(하네스)를 추적합니다.

## 시스템 아키텍처 및 운영 원칙

이 시스템은 현대적인 AI 인터페이스와 SAP 환경 사이의 브리지 역할을 합니다:

1. **에이전트 계층**: AI 에이전트(Claude Code CLI, Antigravity, Gemini CLI)가 사전 정의된 Harness 역할에 따라 작업을 조율하는 "두뇌" 역할을 합니다.
2. **프로토콜 계층**: MCP(Model Context Protocol)와 같은 표준화된 프로토콜을 사용하여 SAP ADT(ABAP 개발 도구) 기능을 에이전트에게 안전하게 노출합니다.
3. **SAP 계층**: REST API와 WebSocket을 통해 SAP 시스템과 직접 상호작용하며, 디버깅, 쿼리 실행, 객체 관리 등 상태 기반 작업을 수행합니다.

## 에이전트 프레임워크 (AGENTS.md)

AI 에이전트는 **PM 주도 거버넌스** 모델 하에 두 가지 전략 그룹으로 운영됩니다:

- **🏢 비즈니스 그룹**: PM과 모듈 분석가(SD, MM, FI 등)로 구성되며, 비즈니스 요구사항을 기술 요구사항으로 전환합니다.
- **🛠️ 기술 그룹**: 아키텍트, 개발자, DBA, QA, 전문가(Fiori, Forms, GUI, 인터페이스)로 구성되며, 솔루션을 구현하고 검증합니다.

역할, 트리거 키워드, 핸드오프 프로토콜에 대한 자세한 내용은 [AGENTS.md](AGENTS.md)를 참조하세요.

## 핵심 문서

| 파일 | 목적 |
| :--- | :--- |
| **[AGENTS.md](AGENTS.md)** | 역할, 협업 워크플로우, 서브에이전트 디스패치 프로토콜 |
| **[docs/context.md](docs/context.md)** | **공유** 프로젝트 컨텍스트: 빌드 명령어, 코드베이스 맵, 개발 규칙 |
| **[skills/abap-dev/SKILL.md](skills/abap-dev/SKILL.md)** | 전문 AI 스킬(BAPI 탐색기, 메모리 인텔리전스) 및 QA 체인 |
| **[docs/setup-guide.md](docs/setup-guide.md)** | 단계별 환경 설정(MCP, SAP, abapGit) |
| **[memory/MEMORY.md](memory/MEMORY.md)** | 개발 이력 및 아키텍처 결정 인덱스 |

## 운영 워크플로우

이 프로젝트는 표준화된 **6단계 Harness Engineering 워크플로우**를 따릅니다:
1. **트리아지 & 리서치** → 2. **비즈니스 분석** → 3. **거버넌스 승인** → 4. **기술 설계** → 5. **구현 & 검증** → 6. **최종화**

상세한 실행 순서는 [AGENTS.md § 협업 워크플로우](AGENTS.md#agent-coordination-workflow-harness-advanced)를 참조하세요.

---
> [!TIP]
> **이 프로젝트가 처음이신가요?** [docs/setup-guide.md](docs/setup-guide.md)에서 시작하세요 — MCP 연결, abapGit, AI 에이전트 설정을 포함한 단계별 환경 구성 가이드입니다.



---

## 라이센스

이 프로젝트는 **GNU Affero General Public License v3.0 (AGPL v3)** 라이센스를 적용합니다.
자세한 내용은 [LICENSE](LICENSE)를 참조하세요. 상업용 라이센스도 제공됩니다 — [CONTRIBUTING.md](CONTRIBUTING.md)를 확인하세요.

---

*Harness Engineering 팀이 유지 관리 | 최종 업데이트: 2026-05-23*
