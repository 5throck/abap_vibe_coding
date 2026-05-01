# LE Analyst Context — Logistics Execution

> Load this file when activating the LE Analyst role.
> Provides deep domain knowledge for shipping, transport, and warehouse processes.

---

## Process Flow

```
VL01N (납품 생성 ← SD 판매오더)
  └─► VL02N (피킹 지시 / 수량 확인)
        ├─► LT01 (Transfer Order 생성 — WM 창고)
        │     └─► LT0A (TO 확인)
        └─► VL02N PGI (출고 기장 — Post Goods Issue)
              └─► VT01N (운송 생성)
                    └─► VT02N (운송 실행 / 체크인·체크아웃)
```

- 납품 유형: `LF`(표준), `LR`(반품), `NL`(보충납품)
- 운송 유형: 도로(`01`), 철도(`02`), 항공(`04`)
- 창고 관리: IM(재고관리) → WM(창고관리) → EWM(확장 창고관리)

---

## Key Table Relationships

```
LIKP (납품 헤더)
  ├── LIPS (납품 항목)
  │     └── VBFA (문서 흐름 → 판매오더 역추적)
  └── VEKP (핸들링 유닛 헤더)
        └── VEPO (핸들링 유닛 항목)

VTTK (운송 헤더)
  └── VTTP (운송 단계)
        └── VTTS (운송 단계 정류장)
              └── VTSP (정류장-납품 배정)

LTAK (Transfer Order 헤더 — WM)
  └── LTAP (Transfer Order 항목)
        └── LGPLA (보관위치 정보)
```

---

## Common Query Patterns

```sql
-- 출고 미완료 납품 조회
SELECT vbeln, erdat, kunnr, lfart, wbstk
  FROM likp
  WHERE wbstk <> 'C' AND erdat >= '20260101'
  ORDER BY erdat DESCENDING

-- 핸들링 유닛 내용물 조회
SELECT a~exidv, a~brgew, a~gewei, b~matnr, b~lgmng, b~meins
  FROM vekp AS a JOIN vepo AS b ON a~venum = b~venum
  WHERE a~vpobj = '02' AND a~vpobjkey = '<DELIVERY_NUMBER>'

-- 운송별 납품 매핑
SELECT a~tknum, a~tpbez, b~vbeln AS delivery, c~vstel
  FROM vttk AS a
  JOIN vttp AS b ON a~tknum = b~tknum
  JOIN vtsp AS c ON b~tknum = c~tknum AND b~tsnum = c~tsnum
  WHERE a~tpbez >= '20260501'

-- WM Transfer Order 미확인 건
SELECT a~tanum, a~lgnum, a~bdatu, b~matnr, b~sollm, b~istme
  FROM ltak AS a JOIN ltap AS b ON a~lgnum = b~lgnum AND a~tanum = b~tanum
  WHERE a~kquit = ' ' AND a~bdatu >= '20260101'
```

---

## Key Field Notes

| Table | Field | 설명 |
|-------|-------|------|
| LIKP | WBSTK | 출고 상태: ` `=미처리, `A`=부분, `C`=완료 |
| LIKP | KODAT | 피킹 날짜 |
| LIPS | PIKMG | 피킹 수량 |
| VEKP | EXIDV | 외부 HU 번호 (바코드) |
| VTTK | TKNUM | 운송 번호 |
| LTAK | KQUIT | TO 확인 여부: ` `=미확인, `Q`=확인 |

---

## SAP Quirks & Known Issues

- **PGI 역기장**: `VL09` 트랜잭션 — 재고이동 취소. MSEG에 취소 문서 생성됨
- **WM-IM 연동**: IM 출고기장 전 WM TO가 모두 확인되어야 함 (LTAK.KQUIT = 'Q')
- **EWM vs WM**: EWM은 별도 시스템(/SCWM/ 네임스페이스), WM은 동일 SAP 내 LG* 테이블
- **핸들링 유닛 중첩**: VEKP가 재귀 구조 — VEPO.VENUM이 다른 VEKP를 참조 가능
- **운송 통합**: VTTP.VBELN이 여러 납품을 하나의 운송으로 묶음

---

## Standard Customizing Tables

| 테이블 | 용도 |
|--------|------|
| TVLK | 납품 유형 |
| T173 | 운송 조건 |
| T001L | 보관위치 (IM) |
| T300 | 창고 번호 (WM) |
| T301 | 보관 유형 (WM) |

---
*Last Updated: 2026-05-01*
