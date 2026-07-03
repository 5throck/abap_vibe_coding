REPORT zprog_inv_demo.

* Simple Inventory Management Demo Program
* This demonstrates basic inventory operations without complex class dependencies

TABLES: mara.

SELECTION-SCREEN BEGIN OF BLOCK b1 WITH FRAME TITLE TEXT-001.
  PARAMETERS: p_matnr TYPE mara-matnr OBLIGATORY.
SELECTION-SCREEN END OF BLOCK b1.

SELECTION-SCREEN BEGIN OF BLOCK b2 WITH FRAME TITLE TEXT-002.
  PARAMETERS: p_werks TYPE t001w-werks OBLIGATORY DEFAULT '1000'.
  PARAMETERS: p_lgort TYPE lagp-lgort OBLIGATORY DEFAULT '0001'.
SELECTION-SCREEN END OF BLOCK b2.

START-OF-SELECTION.

  WRITE: / 'Inventory Management Demo'.
  WRITE: / '======================'.
  SKIP.

  WRITE: / 'Material:', p_matnr.
  WRITE: / 'Plant:   ', p_werks.
  WRITE: / 'St.Loc:  ', p_lgort.
  SKIP.

  PERFORM display_material_info USING p_matnr.

END-OF-SELECTION.

*&---------------------------------------------------------------------*
*&      Form  DISPLAY_MATERIAL_INFO
*&---------------------------------------------------------------------*
FORM display_material_info USING iv_matnr TYPE mara-matnr.

  SELECT SINGLE maktg
    FROM makt
    INTO @DATA(lv_maktg)
    WHERE matnr = @iv_matnr
      AND spras = @sy-langu.

  IF sy-subrc = 0.
    WRITE: / 'Description:', lv_maktg.
  ELSE.
    WRITE: / 'Description: Not found'.
  ENDIF.

  SKIP.
  WRITE: / 'This is a demo program. Full inventory management requires:'
  WRITE: / '- Table ZINV_STOCK to be created in SE11'
  WRITE: / '- Class ZCL_INVENTORY_MANAGER to be created in SE24'
  WRITE: / '- Program ZPROG_INVENTORY_MANAGER to be activated'.

ENDFORM.
