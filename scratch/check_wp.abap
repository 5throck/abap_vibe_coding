REPORT ztest_wp.
DATA: lv_val TYPE string.

WRITE: / 'Work Process Parameters:'.

CALL FUNCTION 'TH_GET_PARAMETER'
  EXPORTING
    name  = 'rdisp/wp_no_dia'
  IMPORTING
    value = lv_val.
WRITE: / 'rdisp/wp_no_dia:', lv_val.

CALL FUNCTION 'TH_GET_PARAMETER'
  EXPORTING
    name  = 'rdisp/wp_no_btc'
  IMPORTING
    value = lv_val.
WRITE: / 'rdisp/wp_no_btc:', lv_val.

CALL FUNCTION 'TH_GET_PARAMETER'
  EXPORTING
    name  = 'rdisp/wp_no_spo'
  IMPORTING
    value = lv_val.
WRITE: / 'rdisp/wp_no_spo:', lv_val.

CALL FUNCTION 'TH_GET_PARAMETER'
  EXPORTING
    name  = 'rdisp/wp_no_vb'
  IMPORTING
    value = lv_val.
WRITE: / 'rdisp/wp_no_vb:', lv_val.
