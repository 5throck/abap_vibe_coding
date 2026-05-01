# FI Analyst Context — Financial Accounting

> Load this file when activating the FI Analyst role.
> Provides deep domain knowledge for journal entries, account determination, and financial reporting.

---

## Process Flow

```
FI 전표 발생원:
  ├── SD: VF01 청구 → FI 자동 전기 (VKOA 계정결정)
  ├── MM: MIGO 입고/MIRO 인보이스 → FI 자동 전기 (OBYC 계정결정)
  ├── CO: 원가 배부 → FI 통합 전기 (ACDOCA)
  └── FI 직접: FB01/FB50/FB60/FB70

결산 프로세스:
  F.05 (외화평가) → F-03 (계정 정리) → F.07 (잔액 이월)
```

- 전표 유형: `SA`(G/L), `KR`(벤더 인보이스), `DR`(고객 인보이스), `ZP`(지급)
- 계정 유형: `S`(G/L), `K`(벤더), `D`(고객), `A`(자산)

---

## Key Table Relationships

```
BKPF (FI 전표 헤더)
  └─► BSEG (FI 전표 라인 항목)
        ├─► SKA1 (G/L 계정 마스터)
        ├─► LFA1 (벤더 마스터) ← BSEG.LIFNR
        └─► KNA1 (고객 마스터) ← BSEG.KUNNR

ACDOCA (Universal Journal — S/4HANA)
  ├── 모든 회계 영역 통합 (FI + CO + AA + ML)
  └─► BKPF (전표 헤더 역참조)

FAGLFLEXT (G/L 계정 잔액 — New GL)
SKB1 (G/L 계정 마스터 — 회사코드별)
```

---

## Common Query Patterns

```sql
-- 특정 계정의 전표 내역 조회
SELECT a~bukrs, a~belnr, a~budat, a~blart, b~hkont, b~dmbtr, b~shkzg
  FROM bkpf AS a JOIN bseg AS b ON a~bukrs = b~bukrs AND a~belnr = b~belnr AND a~gjahr = b~gjahr
  WHERE b~hkont = '<GL_ACCOUNT>' AND a~budat >= '20260101' AND a~budat <= '20260531'
  ORDER BY a~budat DESCENDING

-- 미결 벤더 항목 (AP)
SELECT bukrs, belnr, budat, lifnr, dmbtr, waers, zfbdt, zterm
  FROM bseg
  WHERE koart = 'K' AND augbl = ' ' AND gjahr = '2026'
  ORDER BY zfbdt ASCENDING

-- Universal Journal 원가-수익 조합 조회 (S/4HANA)
SELECT rbukrs, racct, kostl, prctr, ksl, rhcur, budat
  FROM acdoca
  WHERE rbukrs = '1000' AND budat >= '20260501' AND budat <= '20260531'
  ORDER BY budat DESCENDING

-- G/L 계정 잔액 (New GL)
SELECT rldnr, rbukrs, racct, ryear, drcrk, tslvt, tsl01, tsl02
  FROM faglflext
  WHERE rbukrs = '1000' AND ryear = '2026' AND racct = '<GL_ACCOUNT>'
```

---

## Key Field Notes

| Table | Field | 설명 |
|-------|-------|------|
| BKPF | BLART | 전표 유형 (SA, KR, DR 등) |
| BKPF | STBLG | 취소 전표 번호 (역분개 시 원전표) |
| BSEG | SHKZG | 차/대변: `S`=차변(Debit), `H`=대변(Credit) |
| BSEG | AUGBL | 정리 전표 번호 (미결 항목 해소 시) |
| BSEG | ZFBDT | 기준일 (지급 만기 계산 기준) |
| ACDOCA | DRCRK | 차/대변: `S`=차변, `H`=대변 |
| ACDOCA | KSL | 전표 통화 금액 |

---

## Account Determination (계정 결정)

| 출처 | 테이블 | 조건 |
|------|--------|------|
| SD 청구 | VKOA | 계정 결정 절차, 계정 키 (ERL, ERS, MWS 등) |
| MM 입고 | T030 / OBYC | 거래 키 (BSX=재고, WRX=GR/IR, PRD=가격차이) |
| MM 인보이스 | T030 | 거래 키 (KBS=계정 배정, WRX 정리) |
| 자산 | ANKL | 자산 클래스별 G/L 계정 |

---

## SAP Quirks & Known Issues

- **BSEG 클러스터 테이블**: 직접 JOIN 성능 나쁨 — `BSID`(미결 고객), `BSAK`(정리 고객), `BSIS`(미결 GL), `BSAS`(정리 GL) 뷰 사용 권장
- **New GL vs Classic GL**: New GL(`FAGLFLEXT`)과 Classic GL(`GLT0`) 병존 가능 — 시스템 설정 확인 필수
- **S/4HANA ACDOCA**: 모든 보조원장이 ACDOCA에 통합 — BSEG는 호환성 유지용
- **외화 평가**: BSEG.DMBTR(현지통화)와 BSEG.WRBTR(전표통화) 차이 주의
- **역분개**: BKPF.STBLG ≠ 0이면 취소 전표 — 원전표와 쌍으로 분석

---

## Standard Customizing Tables

| 테이블 | 용도 |
|--------|------|
| T001 | 회사코드 |
| T009 | 회계연도 변형 |
| T004 | 계정 플랜 |
| T043T | 지급 조건 텍스트 |
| TZUN | 세금 코드 |

---
*Last Updated: 2026-05-01*
