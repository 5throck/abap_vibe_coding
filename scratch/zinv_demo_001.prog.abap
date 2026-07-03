REPORT zinv_demo_001.

* Inventory Management Demo - Simple Version
* No database dependencies for testing SAP connectivity

DATA: gv_material TYPE c LENGTH 20,
      gv_plant    TYPE c LENGTH 10,
      gv_quantity TYPE p DECIMALS 3.

START-OF-SELECTION.

  gv_material = 'MAT001'.
  gv_plant    = '1000'.
  gv_quantity = '100.500'.

  PERFORM display_header.

  WRITE: / 'Material:', gv_material.
  WRITE: / 'Plant:   ', gv_plant.
  WRITE: / 'Quantity:', gv_quantity.
  SKIP.

  PERFORM display_status.

END-OF-SELECTION.

*&---------------------------------------------------------------------*
*&      Form  DISPLAY_HEADER
*&---------------------------------------------------------------------*
FORM display_header.

  WRITE: / 'Inventory Management System'.
  WRITE: / '=========================='.
  WRITE: / 'Demo Program'.
  SKIP.

ENDFORM.

*&---------------------------------------------------------------------*
*&      Form  DISPLAY_STATUS
*&---------------------------------------------------------------------*
FORM display_status.

  WRITE: / 'Status: Successfully connected to SAP'.
  WRITE: / 'System:', sy-sysid, 'Client:', sy-mandt.
  SKIP.

  WRITE: / 'Installation Complete!'.
  WRITE: / 'See memory/2026-05-18.md for details'.

ENDFORM.
