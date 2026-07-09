# Task 30: Scratch Cleanup Automation — 표준 구현

## 1. `scratch/temp/` 파일들을 `scratch/stable/`로 이동
- `scratch/temp/`의 21개 `.abap`/`.ps1` 파일 중 유의미한 파일들을 `scratch/stable/`로 이동
- `scratch/temp/` 비우기
- `.gitignore`에 `scratch/temp/` 추가 (이후 생성되는 임시 파일은 추적하지 않음)

## 2. `scratch/` root-level 파일 정리
- 루트에 있는 ABAP 파일들(`zcl_inventory_manager.clas.abap`, `zinv_*.abap`, `zprog_inv_*.abap` 등 8개)을 `scratch/stable/`로 이동
- `scratch/` 루트를 깔끔하게 유지

## 3. `scripts/scratch-cleanup.ts` 작성
- `bun scripts/scratch-cleanup.ts` CLI 스크립트
- 기능:
  - **`--temp`**: `scratch/temp/` 내 N일 이상된 파일 자동 삭제 (기본 7일)
  - **`--archive-tasks`**: `scratch/tasks/`에서 N일 이상된 완료 태스크(`status: done` 포함) 아카이빙 → `scratch/tasks/archive/`로 이동
  - **`--status`**: scratch/ 디렉토리 현황 출력 (파일 수, 크기, 최근 변경일)
  - **`--dry-run`**: 삭제/이동 예상 목록만 출력 (실제 변경 없음)

## 4. `scripts/audit.ts`에 scratch/ 체크 추가
- `scratch/temp/`에 git-tracked 파일이 없는지 확인
- `scratch/` 루트에 소스 파일이 방치되지 않았는지 확인

## 5. 문서 업데이트
- `docs/co-abap.context.md`에 Task 30 완료 기록 + scratch-cleanup.ts 설명 추가
- `package.json`에 `"scratch-cleanup": "bun scripts/scratch-cleanup.ts"` 스크립트 추가

## 6. 검증
- `bun test` (기존 테스트 회귀 없음)
- `bun scripts/audit.ts` (scratch/ 체크 포함)
- `bun scripts/scratch-cleanup.ts --status` (정상 동작 확인)