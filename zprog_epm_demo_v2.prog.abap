*&---------------------------------------------------------------------*
*& Report ZPROG_EPM_DEMO
*&---------------------------------------------------------------------*
*& Demo program using EPM (Enterprise Procurement Model) data
*&---------------------------------------------------------------------*
REPORT zprog_epm_demo_v2.

TYPES: BEGIN OF ty_report,
         so_id         TYPE snwd_so-so_id,
         company_name  TYPE snwd_bpa-company_name,
         gross_amount  TYPE snwd_so-gross_amount,
         currency_code TYPE snwd_so-currency_code,
       END OF ty_report.

DATA: lt_report TYPE TABLE OF ty_report.

START-OF-SELECTION.
  " Fetching Sales Orders joined with Business Partner (Buyer) info
  SELECT so~so_id, bpa~company_name, so~gross_amount, so~currency_code
    FROM snwd_so AS so
    JOIN snwd_bpa AS bpa ON so~buyer_guid = bpa~node_key
    INTO TABLE @lt_report
    UP TO 20 ROWS.

  IF sy-subrc = 0.
    " Displaying the results using WRITE for terminal output
    WRITE: / 'SO ID', AT 15 'Company Name', AT 50 'Amount', AT 65 'Curr'.
    ULINE.
    LOOP AT lt_report INTO DATA(ls_row).
      WRITE: / ls_row-so_id, AT 15 ls_row-company_name, AT 50 ls_row-gross_amount, AT 65 ls_row-currency_code.
    ENDLOOP.
  ELSE.
    WRITE: 'No EPM Sales Order data found.'.
  ENDIF.
