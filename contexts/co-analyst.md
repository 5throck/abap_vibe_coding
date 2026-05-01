# CO Analyst Context — Controlling

> Load this file when activating the CO Analyst role.
> Provides deep domain knowledge for cost center accounting, internal orders, and profitability analysis.

---

## Process Flow

```
원가 발생:
  ├── FI → CO: FB01/MIRO 전기 시 CO 객체 배부 (KOSTL, AUFNR, PRCTR)
  ├── PP → CO: 생산오더 실적 확인 → 실제원가 배부
  └── HR → CO: 급여 배부 → 코스트센터

원가 배부:
  KSV5 (실제 배부) → KSU5 (실제 안분) → CO88 (WIP 결산)

수익성 분석 (CO-PA):
  SD 청구 → KE21N (CO-PA 직접 전기) → KE30 (PA 보고서)
```

---

## Key Table Relationships

```
CSKS (코스트센터 마스터)
  └─► CSKB (코스트센터 — 코스트 요소별)

COAS (내부오더 마스터)
  └─► COSP (내부오더 계획 원가)
        └─► COEP (내부오더 실제 원가 라인)

CE1xxxx (CO-PA 실제 라인 항목 — xxxx=운영영역)
  └─► CE2xxxx (CO-PA 계획 라인 항목)
CE4xxxx (CO-PA 세그먼트 레벨)

AUFK (오더 마스터 헤더 — 내부오더/생산오더 공통)
COBK (CO 전표 헤더)
  └─► COEJ / COEP (CO 전표 라인 항목)
```

---

## Common Query Patterns

```sql
-- 코스트센터별 실제원가 집계 (당월)
SELECT kostl, kstar, wrttp, wkgbtr
  FROM cosp
  WHERE kokrs = '1000' AND gjahr = '2026' AND versn = '0' AND wrttp = '04'
  ORDER BY kostl ASCENDING

-- 내부오더 잔액 조회 (미결 오더)
SELECT a~aufnr, a~ktext, b~kstar, b~wkgbtr
  FROM coas AS a JOIN cosp AS b ON a~aufnr = b~aufnr AND a~kokrs = b~kokrs
  WHERE a~kokrs = '1000' AND a~objnr NOT LIKE 'OR%TECO%' AND b~gjahr = '2026'

-- CO-PA 매출/원가 조회 (운영영역 1000 기준)
SELECT prctr, kdgrp, artnr, kwbrum, kwbhkm
  FROM ce11000
  WHERE gjahr = '2026' AND perde = '05'
  ORDER BY kwbrum DESCENDING

-- WIP (재공품) 현황
SELECT aufnr, gjahr, versn, wip_value
  FROM cooi
  WHERE kokrs = '1000' AND gjahr = '2026' AND versn = '0'
```

---

## Key Field Notes

| Table | Field | 설명 |
|-------|-------|------|
| COSP | WRTTP | 값 유형: `01`=계획, `04`=실제, `11`=배부 실제 |
| COSP | WKGBTR | 금액 (현지통화) |
| COSP | KSTAR | 원가 요소 |
| CE1xxxx | PRCTR | 수익 센터 |
| CE1xxxx | KWBRUM | 매출액 |
| CE1xxxx | KWBHKM | 매출원가 |
| COAS | OBJNR | 오더 객체 번호 (배부/안분 연결 키) |

---

## CO-PA Structure

CO-PA는 두 가지 유형:

| 유형 | 테이블 | 특징 |
|------|--------|------|
| **계정 기반 (Account-based)** | ACDOCA | S/4HANA 권장, FI와 완전 통합 |
| **원가 기반 (Costing-based)** | CE1xxxx | 전통적, 가치 필드 기반, 실시간 집계 |

- 운영영역(Controlling Area) = `KOKRS` — 모든 CO 쿼리에 필수
- CO-PA 특성값(Characteristics): KDGRP(고객그룹), ARTNR(제품그룹), BZIRK(영업구역)
- CO-PA 가치 필드(Value Fields): VV010(매출), VV020(매출원가), VV030(판관비)

---

## SAP Quirks & Known Issues

- **CE1xxxx 테이블명**: 운영영역 번호가 테이블명에 포함됨 — `CE1` + 운영영역(4자리). 운영영역 확인: `TKA01`
- **원가 요소 vs G/L 계정**: S/4HANA에서 통합됨 (`SKA1` = 원가 요소). Classic에서는 `CSKA` 별도 유지
- **배부 사이클**: COSP의 WRTTP=11이 배부 결과 — 원천 찾으려면 COEP 사이클 역추적 필요
- **실제 안분(Actual Assessment)**: KSU5 실행 결과는 COEP에 BEKNZ='A' 로 기록
- **CO-PA 역기장**: CE1xxxx에 음수 레코드 생성 — 원전표와 합산해야 최종 잔액

---

## Standard Customizing Tables

| 테이블 | 용도 |
|--------|------|
| TKA01 | 관리회계 영역 |
| CSLA | 활동 유형 마스터 |
| TKA05 | 버전 (계획/실제) |
| TKEV | CO-PA 운영영역 |
| TKE1 | CO-PA 특성값 정의 |

---
*Last Updated: 2026-05-01*
