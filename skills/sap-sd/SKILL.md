---
name: SAP SD Module — Sales & Distribution
description: Use when working on SD module tasks — sales orders, deliveries, billing, pricing, or order-to-cash processes. Provides process flows, key table relationships, common query patterns, field notes, SAP quirks, and standard BAPIs for the SD module.
version: 1.0.0
---

# SD Analyst Context — Sales & Distribution

Load this skill when activating the SD Analyst role. Provides deep domain knowledge for process analysis, table relationships, and common query patterns.

## Process Flow

```
VA01 (Create Quote/Order)
  └─► VA02 (Change Order) / VA03 (Display)
        └─► VL01N (Create Delivery)
              └─► VL02N (Confirm Picking/Goods Issue)
                    └─► VF01 (Create Billing Document)
                          └─► VF02 (Cancel/Modify Billing Document)
```

- Sales Order Type: `TA` (Standard), `RE` (Return), `KA` (Consignment), `CS` (Service)
- Delivery Type: `LF` (Standard Delivery), `LR` (Return Delivery)
- Billing Type: `F2` (Standard Billing), `G2` (Credit Memo), `L2` (Debit Memo)

## Key Table Relationships

```
VBAK (Sales Order Header)
  ├── VBKD (Business Data: Payment Terms, Incoterms)
  └── VBAP (Sales Order Item)
        ├── VBEP (Schedule Lines)
        ├── KONV (Pricing Condition Details)  ← VBAP.KNUMV = KONV.KNUMV
        └── VBFA (Document Flow)      ← Delivery/Billing Connection

LIKP (Delivery Header)
  └── LIPS (Delivery Item)
        └── VBFA (Delivery → Billing Flow)

VBRK (Billing Header)
  └── VBRP (Billing Item)
        └── BKPF/BSEG (FI Document Connection)  ← VBRK.BELNR
```

## Common Query Patterns

```sql
-- Undelivered Sales Orders (Incomplete Delivery Items)
SELECT a~vbeln, a~erdat, a~kunnr, b~posnr, b~matnr, b~kwmeng, b~lfsta
  FROM vbak AS a JOIN vbap AS b ON a~vbeln = b~vbeln
  WHERE a~auart = 'TA' AND b~lfsta <> 'C' AND a~erdat >= '20260101'
  ORDER BY a~erdat DESCENDING

-- Unbilled Deliveries Search
SELECT a~vbeln, a~erdat, a~kunag, b~posnr, b~matnr, b~fksta
  FROM likp AS a JOIN lips AS b ON a~vbeln = b~vbeln
  WHERE b~fksta <> 'C'

-- Pricing Condition Details (Specific Order)
SELECT a~kschl, a~kwert, a~waers, a~kpein, a~kmein
  FROM konv AS a JOIN vbak AS b ON b~knumv = a~knumv
  WHERE b~vbeln = '<ORDER_NUMBER>'

-- Sales Aggregation by Customer (Current Month)
SELECT kunnr, COUNT(*) AS order_cnt, SUM( netwr ) AS total_net
  FROM vbak
  WHERE auart = 'TA' AND erdat >= '20260501' AND erdat <= '20260531'
  GROUP BY kunnr ORDER BY total_net DESCENDING
```

## Key Field Notes

| Table | Field | Description |
|-------|-------|-------------|
| VBAP | KWMENG | Quantity — Always stored in Base Unit (MEINS) |
| VBAP | LFSTA | Delivery Status: ` `=Not Processed, `A`=Partial, `B`=Completed |
| VBAP | FKSTA | Billing Status: ` `=Not Processed, `A`=Partial, `C`=Completed |
| VBAK | AUART | Sales Order Type (TA, RE, KA, etc.) |
| KONV | KSCHL | Condition Type (PR00=Base Price, MWST=Tax, etc.) |
| VBFA | VBTYP_N | Subsequent Document Type: `J`=Delivery, `M`=Billing |

## SAP Quirks & Known Issues

- **Pricing Re-determination**: KONV records are deleted and recreated — use CDHDR/CDPOS for history tracking
- **Partial Delivery**: Split based on VBEP (Schedule Lines), one VBAP item can have multiple VBEP records
- **Return Orders (RE)**: Always check VBAK.AUGRU (Order Reason) field
- **Credit Block**: VBUK.CMGST = `B` indicates a credit block — check before shipment
- **VBFA Document Flow**: Recursive structure requires repeated queries for multi-level tracking

## Standard Customizing Tables

| Table | Purpose |
|-------|---------|
| TVAK | Sales Order Type Definition |
| TVLK | Delivery Type Definition |
| TVFK | Billing Type Definition |
| VKOA | Account Determination (FI Link) |
| T685 | Pricing Condition Type Definition |
| TVZA | Payment Terms |
| VBUK | Sales Document Header Status (Legacy) |
| VBUP | Sales Document Item Status (Legacy) |

## Strategic BAPIs & APIs

### Sales Order Creation
**BAPI**: `BAPI_SALESORDER_CREATEFROMDAT2`
- `ORDER_HEADER_IN`: `AUART` (Type), `VKORG` (Sales Org), `VTWEG` (Dist. Channel)
- `ORDER_ITEMS_IN`: `MATERIAL`, `PLANT`, `TARGET_QUY`
- `ORDER_PARTNERS`: `PARTN_ROLE` (`SP`=Sold-to, `SH`=Ship-to), `PARTN_NUMB`

### Delivery Management
**BAPI**: `BAPI_OUTB_DELIVERY_CREATE_SLS`
- Used to create delivery from sales order.
