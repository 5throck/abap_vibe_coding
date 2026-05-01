# PP Analyst Context — Production Planning

> Load this file when activating the PP Analyst role.
> Provides deep domain knowledge for BOM, routing, production orders, and MRP.

---

## Process Flow

```
MM60 / MD01 (MRP 실행)
  └─► MD04 (재고/수요 상황 조회)
        └─► CO01 (생산오더 생성)
              ├─► CO11N (실적 확인 — Confirmation)
              │     └─► MIGO 261 (실제 출고 — Goods Issue)
              └─► CO02 (생산오더 변경)
                    └─► CO15 (최종 확인 + 입고)
                          └─► MIGO 101 (생산 입고 — Goods Receipt)
```

- 생산오더 유형: `PP01`(표준), `PP04`(재작업), `PM01`(정비오더)
- MRP 유형: `PD`(MRP), `VB`(재주문점), `VM`(자동 재주문점)

---

## Key Table Relationships

```
MAST (자재-BOM 연결)
  └─► STKO (BOM 헤더)
        └─► STPO (BOM 항목)
              └─► MARA (구성 자재 마스터)

PLKO (공정 헤더 — Routing)
  └─► PLSO (공정 순서)
        └─► PLPO (공정 작업 — Operation)
              └─► CRHD (작업장 헤더)

AUFK (생산오더 헤더)
  └─► AFKO (생산오더 MRP 헤더)
        └─► AFPO (생산오더 항목)
              ├─► AFVC (공정 — Production Order Operations)
              └─► RESB (구성 자재 소요량)
```

---

## Common Query Patterns

```sql
-- BOM 구성 조회 (단일 레벨)
SELECT a~matnr AS parent, b~idnrk AS component, b~menge, b~meins, b~postp
  FROM mast AS a JOIN stpo AS b ON a~stlnr = b~stlnr AND a~stlal = b~stlal
  WHERE a~matnr = '<MATERIAL_NUMBER>' AND a~werks = '1000'

-- 생산오더 현황 (진행 중)
SELECT a~aufnr, a~matnr, a~gamng, a~gmein, b~getri, b~gltri
  FROM aufk AS a JOIN afko AS b ON a~aufnr = b~aufnr
  WHERE a~autyp = '10' AND a~sysst <> 'TECO'
  ORDER BY b~gltri ASCENDING

-- 실적 미확인 공정 조회
SELECT a~aufnr, b~vornr, b~ltxa1, b~wemng, b~rmnga
  FROM afko AS a JOIN afvc AS b ON a~aufnr = b~aufnr
  WHERE b~iedd >= '20260401' AND b~rmnga < b~wemng

-- MRP 수요/공급 현황 (MD04 대체)
SELECT matnr, werks, plart, dispo, mabst, eisbe
  FROM marc
  WHERE werks = '1000' AND dismm = 'PD'
```

---

## Key Field Notes

| Table | Field | 설명 |
|-------|-------|------|
| AUFK | SYSST | 시스템 상태: `REL`=릴리즈, `CNF`=확인완료, `TECO`=기술완료, `DLT`=삭제 |
| AFKO | GETRI | 생산오더 시작일 |
| AFKO | GLTRI | 생산오더 종료일 (납기) |
| STPO | POSTP | BOM 항목 유형: `L`=재고 항목, `N`=비재고 |
| RESB | BDMNG | 소요량 |
| RESB | ENMNG | 인출 완료량 |
| PLPO | ARBID | 작업장 ID (→ CRHD 조인) |

---

## SAP Quirks & Known Issues

- **BOM 대체**: MAST.STLAL = '01'이 주 BOM. 대체 BOM은 '02', '03' — 항상 STLAL 지정
- **공정 병렬**: PLSO.PLSEQ로 병렬 공정 식별 — 단순 PLPO 조회 시 누락 가능
- **실적 과다 확인**: AFVC.RMNGA > AFVC.WEMNG 허용됨 — 초과 생산 추적 필요
- **MRP 실행 후 예외 메시지**: MDAB(예외 메시지 목록) 테이블 확인 필수
- **반복 제조 (REM)**: AUFK 없이 MFPR(계획 지시) 기반으로 운영 — PP 분석가에게 별도 흐름

---

## Standard Customizing Tables

| 테이블 | 용도 |
|--------|------|
| T399D | 생산오더 유형 |
| TC24 | 작업장 카테고리 |
| MKAL | 생산 버전 |
| T430 | MRP 컨트롤러 |

---
*Last Updated: 2026-05-01*
