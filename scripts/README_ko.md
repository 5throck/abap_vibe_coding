# 프로젝트 스크립트 (Project Scripts)

모든 프로젝트 자동화 스크립트는 **TypeScript**로 구현되며 **Bun** 런타임에서 실행됩니다.

## 사용 가능한 스크립트

### 핵심 파이프라인 스크립트

| 스크립트 | 목적 |
|---------|------|
| `dev-sync.ts` | 전체 동기화 파이프라인 (memlog → changelog → audit → commit → PR) |
| `audit.ts` | 문서 및 파일 무결성 감사 |
| `sync-md.ts` | memory/MEMORY.md 인덱스 업데이트 |
| `vsp-audit.ts` | 레거시 감사 래퍼 (audit.ts에 위임) |

### 유틸리티 스크립트

| 스크립트 | 목적 |
|---------|------|
| `git-sync.ts` | 전체 변경사항 커밋 및 푸시 |
| `vsp-task.ts` | 템플릿에서 태스크 파일 생성 |
| `install-bun.ts` | Bun 런타임 설치 |
| `install-vsp.ts` | GitHub Releases에서 VSP 바이너리 설치 |
| `setup.ts` | 스캐폴드 후 환경 설정 (OS/스택 감지, 의존성, 라이선스 감사) |
| `vsp-publish.ts` | 핵심 프레임워크 에셋을 플러그인 저장소에 패키징 및 배포 (`CLAUDE_PLUGIN_ROOT` 필요) |

### 에이전트 오케스트레이션 스크립트

| 스크립트 | 목적 |
|---------|------|
| `verify-skills.ts` | `skills/` 디렉토리의 모든 스킬이 로드 가능한지 확인 |
| `agent-create.ts` | 새 에이전트 정의 파일 생성 |
| `agent-list.ts` | 메타데이터와 함께 모든 에이전트 나열 |
| `agent-delete.ts` | 에이전트 파일 삭제 |
| `agent-verify.ts` | 에이전트/문서 동기화 확인 |
| `dispatch.ts` | 에이전트 디스패치를 위한 메인 진입점 |
| `dispatch-parallel.ts` | 병렬 에이전트 디스패처 |
| `dispatch-serial.ts` | 종속성이 있는 직렬 에이전트 디스패처 |
| `retry-handler.ts` | 지수 백오프가 포함된 재시도 로직 |

## NPM 스크립트

`package.json`에 정의된 편의 단축키:

```bash
bun run audit            # 워크스페이스 표준 감사 실행
bun run dev-sync         # 전체 동기화 파이프라인
bun run sync-md          # 메모리 인덱스 업데이트
bun run vsp-audit        # 레거시 감사 래퍼
bun run git-sync         # 전체 변경사항 커밋 및 푸시
bun run vsp-task         # 새 태스크 파일 생성
bun run install:vsp      # VSP 바이너리 설치
bun run setup            # 스캐폴드 후 환경 설정
bun run verify-skills    # 스킬 확인
bun run agent:create     # 새 에이전트 생성
bun run agent:list       # 에이전트 목록
bun run agent:delete     # 에이전트 삭제
bun run agent:verify     # 에이전트/문서 동기화 확인
bun run dispatch:parallel  # 병렬 디스패치 실행
bun run dispatch:serial    # 직렬 디스패치 실행
```

## 런타임 요구사항

- **Bun >= 1.0.0** — 모든 스크립트는 `#!/usr/bin/env bun`과 Bun 전용 API(`Bun.$`, `Bun.file`, `Bun.write`, `import.meta.path`)를 사용합니다
- **Git** — dev-sync, git-sync, setup에서 사용
- **GitHub CLI (`gh`)** — dev-sync에서 PR 생성에 사용

## 파일 인코딩

모든 스크립트는 **UTF-8 (BOM 없음)**으로 저장됩니다.

## 스크립트 규칙

- 셰뱅: `#!/usr/bin/env bun`
- 경로 해석: `const scriptDir = path.dirname(import.meta.path); const projectRoot = path.resolve(scriptDir, "..");`
- 셸 실행: git/gh 명령어에 `import { $ } from 'bun'` 사용
- 파일 I/O: `Bun.file()` / `Bun.write()` 또는 `node:fs` API
- CLI 패턴: 수동 `process.argv` 파싱, `import.meta.main` 가드
- 이중 사용: 모든 스크립트는 CLI 실행과 `export { main }` 모듈 사용을 모두 지원합니다

---

*프로젝트 템플릿 - 필요에 따라 사용자 정의하세요*
