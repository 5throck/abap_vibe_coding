# SD Analyst Context — Sales & Distribution

> Load this file when activating the SD Analyst role.
> Provides deep domain knowledge for process analysis, table relationships, and common query patterns.

---

## Process Flow

```
VA01 (견적/오더 생성)
  └─► VA02 (오더 변경) / VA03 (조회)
        └─► VL01N (납품 생성)
              └─► VL02N (피킹/입고 확인)
                    └─► VF01 (청구서 생성)
                          └─► VF02 (청구 취소/수정)
```

- 판매오더 유형: `TA` (표준), `RE` (반품), `KA` (콘사인), `CS` (서비스)
- 납품 유형: `LF` (표준납품), `LR` (반품납품)
- 청구 유형: `F2` (표준청구), `G2` (대변메모), `L2` (차변메모)

---

## Key Table Relationships

```
VBAK (판매오더 헤더)
  ├── VBKD (비즈니스 데이터: 지불조건, Incoterms)
  └── VBAP (판매오더 항목)
        ├── VBEP (납품일정)
        ├── KONV (가격조건 명세)  ← VBAP.KNUMV = KONV.KNUMV
        └── VBFA (문서 흐름)      ← 납품/청구 연결

LIKP (납품 헤더)
  └── LIPS (납품 항목)
        └── VBFA (납품→청구 흐름)

VBRK (청구 헤더)
  └── VBRP (청구 항목)
        └── BKPF/BSEG (FI 전표 연결)  ← VBRK.BELNR
```

---

## Common Query Patterns

```sql
-- 미납품 판매오더 (납품 미완료 항목)
SELECT a~vbeln, a~erdat, a~kunnr, b~posnr, b~matnr, b~kwmeng, b~lfsta
  FROM vbak AS a JOIN vbap AS b ON a~vbeln = b~vbeln
  WHERE a~auart = 'TA' AND b~lfsta <> 'C' AND a~erdat >= '20260101'
  ORDER BY a~erdat DESCENDING

-- 미청구 납품 조회
SELECT a~vbeln, a~erdat, a~kunag, b~posnr, b~matnr, b~fksta
  FROM likp AS a JOIN lips AS b ON a~vbeln = b~vbeln
  WHERE b~fksta <> 'C'

-- 가격조건 상세 (특정 오더)
SELECT a~kschl, a~kwert, a~waers, a~kpein, a~kmein
  FROM konv AS a JOIN vbak AS b ON b~knumv = a~knumv
  WHERE b~vbeln = '<ORDER_NUMBER>'

-- 고객별 매출 집계 (당월)
SELECT kunnr, COUNT(*) AS order_cnt, SUM( netwr ) AS total_net
  FROM vbak
  WHERE auart = 'TA' AND erdat >= '20260501' AND erdat <= '20260531'
  GROUP BY kunnr ORDER BY total_net DESCENDING
```

---

## Key Field Notes

| Table | Field | 설명 |
|-------|-------|------|
| VBAP | KWMENG | 수량 — 항상 기준단위(MEINS)로 저장 |
| VBAP | LFSTA | 납품 상태: ` `=미처리, `A`=부분, `B`=완료 |
| VBAP | FKSTA | 청구 상태: ` `=미처리, `A`=부분, `C`=완료 |
| VBAK | AUART | 판매오더 유형 (TA, RE, KA 등) |
| KONV | KSCHL | 가격조건 유형 (PR00=기본가, MWST=세금 등) |
| VBFA | VBTYP_N | 후속 문서 유형: `J`=납품, `M`=청구 |

---

## SAP Quirks & Known Issues

- **가격조건 재결정**: KONV 레코드 삭제 후 재생성됨 — 이력 조회 시 CDHDR/CDPOS 사용
- **부분납품**: VBEP(납품일정) 기준으로 분할됨, VBAP 한 줄이 여러 VBEP를 가짐
- **반품오더(RE)**: VBAK.AUGRU(오더 이유) 필드 반드시 확인
- **크레딧 블록**: VBUK.CMGST = `B`이면 신용 블록 상태 — 출하 전 확인 필요
- **VBFA 문서흐름**: 재귀 구조이므로 다단계 추적 시 반복 조회 필요

---

## Standard Customizing Tables

| 테이블 | 용도 |
|--------|------|
| TVAK | 판매오더 유형 정의 |
| TVLK | 납품 유형 정의 |
| TVFK | 청구 유형 정의 |
| VKOA | 계정 결정 (FI 연결) |
| T685 | 가격조건 유형 정의 |
| TVZA | 지불조건 |

---
*Last Updated: 2026-05-01*
