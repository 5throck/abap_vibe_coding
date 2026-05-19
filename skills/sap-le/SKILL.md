---
name: SAP LE Module — Logistics Execution
description: Use when working on LE module tasks — shipping, transport, warehouse management, delivery processing, or handling units. Provides process flows, key table relationships, common query patterns, field notes, SAP quirks, and customizing tables for the LE module.
version: 1.0.0
---

# LE Analyst Context — Logistics Execution

Load this skill when activating the LE Analyst role. Provides deep domain knowledge for shipping, transport, and warehouse processes.

## Process Flow

```
VL01N (Create Delivery ← SD Sales Order)
  └─► VL02N (Picking Instruction / Quantity Confirmation)
        ├─► LT01 (Create Transfer Order — WM Warehouse)
        │     └─► LT0A (Confirm TO)
        └─► VL02N PGI (Post Goods Issue)
              └─► VT01N (Create Shipment)
                    └─► VT02N (Execute Shipment / Check-in & Check-out)
```

- Delivery Type: `LF` (Standard), `LR` (Return), `NL` (Replenishment)
- Transport Type: Road (`01`), Rail (`02`), Air (`04`)
- Warehouse Management: IM (Inventory Management) → WM (Warehouse Management) → EWM (Extended Warehouse Management)

## Key Table Relationships

```
LIKP (Delivery Header)
  ├── LIPS (Delivery Item)
  │     └── VBFA (Document Flow → Sales Order Backtrace)
  └── VEKP (Handling Unit Header)
        └── VEPO (Handling Unit Item)

VTTK (Shipment Header)
  └── VTTP (Shipment Stage)
        └── VTTS (Shipment Stage Stop)
              └── VTSP (Stop-Delivery Assignment)

LTAK (Transfer Order Header — WM)
  └── LTAP (Transfer Order Item)
        └── LGPLA (Storage Location Info)
```

## Common Query Patterns

```sql
-- Deliveries with Incomplete Goods Issue Search
SELECT vbeln, erdat, kunnr, lfart, wbstk
  FROM likp
  WHERE wbstk <> 'C' AND erdat >= '20260101'
  ORDER BY erdat DESCENDING

-- Handling Unit Content Search
SELECT a~exidv, a~brgew, a~gewei, b~matnr, b~lgmng, b~meins
  FROM vekp AS a JOIN vepo AS b ON a~venum = b~venum
  WHERE a~vpobj = '02' AND a~vpobjkey = '<DELIVERY_NUMBER>'

-- Delivery Mapping per Shipment
SELECT a~tknum, a~tpbez, b~vbeln AS delivery, c~vstel
  FROM vttk AS a
  JOIN vttp AS b ON a~tknum = b~tknum
  JOIN vtsp AS c ON b~tknum = c~tknum AND b~tsnum = c~tsnum
  WHERE a~tpbez >= '20260501'

-- Unconfirmed WM Transfer Orders
SELECT a~tanum, a~lgnum, a~bdatu, b~matnr, b~sollm, b~istme
  FROM ltak AS a JOIN ltap AS b ON a~lgnum = b~lgnum AND a~tanum = b~tanum
  WHERE a~kquit = ' ' AND a~bdatu >= '20260101'
```

## Key Field Notes

| Table | Field | Description |
|-------|-------|-------------|
| LIKP | WBSTK | Goods Issue Status: ` `=Not Processed, `A`=Partial, `C`=Completed |
| LIKP | KODAT | Picking Date |
| LIPS | PIKMG | Picking Quantity |
| VEKP | EXIDV | External HU Number (Barcode) |
| VTTK | TKNUM | Shipment Number |
| LTAK | KQUIT | TO Confirmation Status: ` `=Unconfirmed, `Q`=Confirmed |

## SAP Quirks & Known Issues

- **PGI Reversal**: `VL09` transaction — cancellation of goods movement. Cancellation document created in MSEG.
- **WM-IM Integration**: All WM TOs must be confirmed (LTAK.KQUIT = 'Q') before IM PGI.
- **EWM vs WM**: EWM is a separate system (/SCWM/ namespace), WM uses LG* tables within the same SAP system.
- **Handling Unit Nesting**: VEKP is a recursive structure — VEPO.VENUM can refer to another VEKP.
- **Shipment Consolidation**: VTTP.VBELN groups multiple deliveries into a single shipment.

## Standard Customizing Tables

| Table | Purpose |
|-------|---------|
| TVLK | Delivery Types |
| T173 | Shipping Conditions |
| T001L | Storage Location (IM) |
| T300 | Warehouse Number (WM) |
| T301 | Storage Type (WM) |
