# MM Analyst Context — Materials Management

> Load this file when activating the MM Analyst role.
> Provides deep domain knowledge for purchasing, goods receipt, material master, and inventory.

---

## Process Flow

```
ME51N (구매 요청 생성)
  └─► ME21N (구매오더 생성)
        └─► MIGO 101 (입고 — Goods Receipt)
              ├─► MIRO (인보이스 검증 — Invoice Verification)
              │     └─► FBL1N (벤더 라인 항목 확인)
              └─► MIGO 122 (반품 입고)

MM01 (자재마스터 생성) ─► MM02 (변경) ─► MM60 (MRP 실행)
```

- 구매오더 유형: `NB`(표준), `UB`(재고이동), `FO`(프레임 계약)
- 이동 유형 (MIGO): `101`=입고, `122`=반품, `201`=코스트센터 출고, `261`=생산오더 출고

---

## Key Table Relationships

```
EBAN (구매 요청 헤더)
  └─► EBKN (구매 요청 계정 배정)

EKKO (구매오더 헤더)
  ├─► EKPO (구매오더 항목)
  │     └─► EKET (납품 일정)
  └─► EKES (공급업체 확인서)

MKPF (자재 문서 헤더 — 입/출고)
  └─► MSEG (자재 문서 항목)
        └─► EKPO (구매오더 항목 역참조)

MARA (자재마스터 — 일반)
  ├─► MARC (자재마스터 — 플랜트)
  ├─► MARD (자재마스터 — 보관위치 재고)
  └─► MBEW (자재 평가 — 원가)
```

---

## Common Query Patterns

```sql
-- 미입고 구매오더 조회
SELECT a~ebeln, a~erdat, a~lifnr, b~ebelp, b~matnr, b~menge, b~wemng
  FROM ekko AS a JOIN ekpo AS b ON a~ebeln = b~ebeln
  WHERE b~elikz = ' ' AND a~erdat >= '20260101' AND a~bsart = 'NB'
  ORDER BY a~erdat DESCENDING

-- 보관위치별 재고 현황
SELECT matnr, werks, lgort, labst, einme, speme
  FROM mard
  WHERE werks = '1000' AND labst > 0
  ORDER BY labst DESCENDING

-- 자재별 입출고 내역 (당월)
SELECT a~mblnr, a~budat, b~matnr, b~werks, b~lgort, b~bwart, b~menge, b~meins
  FROM mkpf AS a JOIN mseg AS b ON a~mblnr = b~mblnr AND a~mjahr = b~mjahr
  WHERE a~budat >= '20260501' AND a~budat <= '20260531'
  ORDER BY a~budat DESCENDING

-- 자재 평가 (이동평균가)
SELECT matnr, bwkey, vprsv, verpr, stprs, peinh, laepr
  FROM mbew
  WHERE bwkey = '1000' AND matnr = '<MATERIAL_NUMBER>'
```

---

## Key Field Notes

| Table | Field | 설명 |
|-------|-------|------|
| EKPO | ELIKZ | 납품 완료 표시: `X`=완료 |
| EKPO | WEMNG | 입고 수량 |
| EKPO | REMNG | 잔여 수량 (MENGE - WEMNG) |
| MSEG | BWART | 이동 유형 (101, 122, 201, 261 등) |
| MARD | LABST | 자유 사용 재고 |
| MARD | EINME | 품질 검사 재고 |
| MARD | SPEME | 봉쇄 재고 |
| MBEW | VPRSV | 가격 결정 방식: `S`=표준, `V`=이동평균 |
| MBEW | VERPR | 이동 평균가 |

---

## SAP Quirks & Known Issues

- **이동평균가(VPRSV='V') 역분개**: 입고 취소 시 가격 차이가 발생할 수 있음 — MBEW.VERPR 재계산
- **분할 평가**: 동일 자재가 여러 MBEW 레코드를 가짐 (BWTAR 필드로 구분) — 집계 시 합산 필요
- **GR-Based IV**: EKPO.WEPOS='X'이면 입고 기반 인보이스 — MIGO 없이는 MIRO 불가
- **자재마스터 조직 수준**: MARA(클라이언트) → MARC(플랜트) → MARD(보관위치) 계층 이해 필수
- **음수 재고**: MARC.LGPRO='X'이면 허용됨 — MARD.LABST < 0 가능

---

## Standard Customizing Tables

| 테이블 | 용도 |
|--------|------|
| T001W | 플랜트 |
| T001L | 보관위치 |
| T024 | 구매 그룹 |
| T161 | 구매오더 유형 |
| T156 | 이동 유형 |
| T157H | 이동 유형 헬프 텍스트 |

---
*Last Updated: 2026-05-01*
