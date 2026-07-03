REPORT zprog_inventory_manager MESSAGE-ID zinv.

TABLES: zinv_stock.

CONSTANTS:
  c_action_create  TYPE char1 VALUE 'C',
  c_action_display TYPE char1 VALUE 'D',
  c_action_add     TYPE char1 VALUE 'A',
  c_action_reduce  TYPE char1 VALUE 'R',
  c_action_modify  TYPE char1 VALUE 'M',
  c_action_delete  TYPE char1 VALUE 'X',
  c_action_list    TYPE char1 VALUE 'L',
  c_action_low     TYPE char1 VALUE 'S',
  c_action_exit    TYPE char1 VALUE 'E'.

SELECTION-SCREEN BEGIN OF BLOCK b1 WITH FRAME TITLE TEXT-001.
  PARAMETERS: p_action TYPE char1 DEFAULT c_action_display.
SELECTION-SCREEN END OF BLOCK b1.

SELECTION-SCREEN BEGIN OF BLOCK b2 WITH FRAME TITLE TEXT-002.
  PARAMETERS: p_matnr  TYPE char20 OBLIGATORY,
              p_werks  TYPE char10 OBLIGATORY,
              p_lgort  TYPE char10 OBLIGATORY.
SELECTION-SCREEN END OF BLOCK b2.

SELECTION-SCREEN BEGIN OF BLOCK b3 WITH FRAME TITLE TEXT-003.
  PARAMETERS: p_maktx  TYPE char40,
              p_menge  TYPE menge_d DEFAULT 0,
              p_meins  TYPE meins,
              p_matkl  TYPE char10,
              p_minst  TYPE menge_d DEFAULT 0,
              p_maxst  TYPE menge_d DEFAULT 0.
SELECTION-SCREEN END OF BLOCK b3.

SELECTION-SCREEN BEGIN OF BLOCK b4 WITH FRAME TITLE TEXT-004.
  PARAMETERS: p_new_q TYPE menge_d DEFAULT 0.
SELECTION-SCREEN END OF BLOCK b4.

INITIALIZATION.
  PERFORM set_defaults.

AT SELECTION-SCREEN OUTPUT.
  PERFORM modify_screen.

AT SELECTION-SCREEN.
  PERFORM validate_input.

START-OF-SELECTION.
  PERFORM execute_action.

END-OF-SELECTION.
  PERFORM display_results.

*&---------------------------------------------------------------------*
*&      Form  SET_DEFAULTS
*&---------------------------------------------------------------------*
FORM set_defaults.
  p_action = c_action_display.
  p_meins  = 'EA'.
ENDFORM.

*&---------------------------------------------------------------------*
*&      Form  MODIFY_SCREEN
*&---------------------------------------------------------------------*
FORM modify_screen.
  DATA: lv_visible TYPE c LENGTH 1.

  CASE p_action.
    WHEN c_action_create OR c_action_modify.
      lv_visible = '1'.
      LOOP AT SCREEN.
        IF screen-group1 = 'B3'.
          screen-active = lv_visible.
          MODIFY SCREEN.
        ENDIF.
      ENDLOOP.

    WHEN c_action_add OR c_action_reduce.
      lv_visible = '1'.
      LOOP AT SCREEN.
        IF screen-group1 = 'B4'.
          screen-active = lv_visible.
          MODIFY SCREEN.
        ENDIF.
      ENDLOOP.
  ENDCASE.
ENDFORM.

*&---------------------------------------------------------------------*
*&      Form  VALIDATE_INPUT
*&---------------------------------------------------------------------*
FORM validate_input.
  DATA: lo_inventory TYPE REF TO zcl_inventory_manager,
        ls_inventory TYPE zcl_inventory_manager=>ty_inventory.

  CASE p_action.
    WHEN c_action_create.
      " Check if item already exists
      SELECT SINGLE *
        FROM zinv_stock
        INTO @DATA(ls_existing)
        WHERE material_id = @p_matnr
          AND plant       = @p_werks
          AND storage_loc = @p_lgort.

      IF sy-subrc = 0.
        MESSAGE e001 WITH 'Item already exists' p_matnr.
      ENDIF.

      IF p_menge < 0.
        MESSAGE e002 WITH 'Quantity cannot be negative'.
      ENDIF.

    WHEN c_action_display OR c_action_add OR c_action_reduce OR
         c_action_modify OR c_action_delete.

      " Check if item exists
      SELECT SINGLE *
        FROM zinv_stock
        INTO @ls_existing
        WHERE material_id = @p_matnr
          AND plant       = @p_werks
          AND storage_loc = @p_lgort
          AND status      = 'A'.

      IF sy-subrc <> 0.
        MESSAGE e003 WITH 'Item not found or inactive' p_matnr.
      ENDIF.

      IF p_action = c_action_reduce AND p_new_q > ls_existing-quantity.
        MESSAGE e004 WITH 'Insufficient stock' ls_existing-quantity.
      ENDIF.

    WHEN c_action_exit.
      LEAVE PROGRAM.
  ENDCASE.
ENDFORM.

*&---------------------------------------------------------------------*
*&      Form  EXECUTE_ACTION
*&---------------------------------------------------------------------*
FORM execute_action.
  DATA: lo_inventory TYPE REF TO zcl_inventory_manager,
        ls_inventory TYPE zcl_inventory_manager=>ty_inventory,
        lt_inventory TYPE zcl_inventory_manager=>tty_inventory,
        lv_success   TYPE abap_bool.

  CASE p_action.
    WHEN c_action_create.
      ls_inventory-material_id = p_matnr.
      ls_inventory-plant        = p_werks.
      ls_inventory-storage_loc  = p_lgort.
      ls_inventory-description  = p_maktx.
      ls_inventory-quantity     = p_menge.
      ls_inventory-unit         = p_meins.
      ls_inventory-category     = p_matkl.
      ls_inventory-min_stock    = p_minst.
      ls_inventory-max_stock    = p_maxst.

      lv_success = zcl_inventory_manager=>create_new_item( ls_inventory ).

      IF lv_success = abap_true.
        MESSAGE s005 WITH 'Item created successfully' p_matnr.
      ELSE.
        MESSAGE e006 WITH 'Failed to create item' p_matnr.
      ENDIF.

    WHEN c_action_display.
      CREATE OBJECT lo_inventory
        EXPORTING
          iv_material_id = p_matnr
          iv_plant       = p_werks
          iv_storage_loc = p_lgort.

      DATA(ls_current) = lo_inventory->get_current_stock( ).
      PERFORM display_single_item USING ls_current.

    WHEN c_action_add.
      CREATE OBJECT lo_inventory
        EXPORTING
          iv_material_id = p_matnr
          iv_plant       = p_werks
          iv_storage_loc = p_lgort.

      TRY.
          lv_success = lo_inventory->add_stock(
            iv_quantity = p_new_q
            iv_unit     = p_meins
          ).

          IF lv_success = abap_true.
            MESSAGE s007 WITH 'Stock added successfully' p_new_q.
          ELSE.
            MESSAGE e008 WITH 'Failed to add stock'.
          ENDIF.
        CATCH cx_abap_invalid_value INTO DATA(lx_error).
          MESSAGE e009 WITH lx_error->get_text( ).
      ENDTRY.

    WHEN c_action_reduce.
      CREATE OBJECT lo_inventory
        EXPORTING
          iv_material_id = p_matnr
          iv_plant       = p_werks
          iv_storage_loc = p_lgort.

      TRY.
          lv_success = lo_inventory->withdraw_stock(
            iv_quantity = p_new_q
            iv_unit     = p_meins
          ).

          IF lv_success = abap_true.
            MESSAGE s010 WITH 'Stock reduced successfully' p_new_q.
          ELSE.
            MESSAGE e011 WITH 'Failed to reduce stock'.
          ENDIF.
        CATCH cx_abap_invalid_value INTO lx_error.
          MESSAGE e009 WITH lx_error->get_text( ).
      ENDTRY.

    WHEN c_action_modify.
      CREATE OBJECT lo_inventory
        EXPORTING
          iv_material_id = p_matnr
          iv_plant       = p_werks
          iv_storage_loc = p_lgort.

      IF p_maktx IS NOT INITIAL.
        lo_inventory->update_description( p_maktx ).
      ENDIF.

      IF p_minst > 0 OR p_maxst > 0.
        lo_inventory->set_min_max_stock(
          iv_min_stock = p_minst
          iv_max_stock = p_maxst
        ).
      ENDIF.

      MESSAGE s012 WITH 'Item modified successfully'.

    WHEN c_action_delete.
      CREATE OBJECT lo_inventory
        EXPORTING
          iv_material_id = p_matnr
          iv_plant       = p_werks
          iv_storage_loc = p_lgort.

      lv_success = lo_inventory->delete( ).

      IF lv_success = abap_true.
        MESSAGE s013 WITH 'Item deleted successfully'.
      ELSE.
        MESSAGE e014 WITH 'Failed to delete item'.
      ENDIF.

    WHEN c_action_list.
      lt_inventory = lo_inventory->get_all_inventory( ).
      PERFORM display_inventory_list USING lt_inventory.

    WHEN c_action_low.
      CREATE OBJECT lo_inventory.
      lt_inventory = lo_inventory->get_low_stock_items( ).
      PERFORM display_inventory_list USING lt_inventory.
  ENDCASE.
ENDFORM.

*&---------------------------------------------------------------------*
*&      Form  DISPLAY_RESULTS
*&---------------------------------------------------------------------*
FORM display_results.
  " Additional output processing if needed
ENDFORM.

*&---------------------------------------------------------------------*
*&      Form  DISPLAY_SINGLE_ITEM
*&---------------------------------------------------------------------*
FORM display_single_item USING is_inventory TYPE zcl_inventory_manager=>ty_inventory.
  WRITE: / 'Inventory Information'.
  WRITE: / '===================='.
  WRITE: / 'Material ID:', is_inventory-material_id.
  WRITE: / 'Plant:      ', is_inventory-plant.
  WRITE: / 'Storage Loc:', is_inventory-storage_loc.
  WRITE: / 'Description:', is_inventory-description.
  WRITE: / 'Quantity:   ', is_inventory-quantity, is_inventory-unit.
  WRITE: / 'Category:   ', is_inventory-category.
  WRITE: / 'Min Stock:  ', is_inventory-min_stock.
  WRITE: / 'Max Stock:  ', is_inventory-max_stock.
  WRITE: / 'Status:     ', is_inventory-status.
  SKIP.
ENDFORM.

*&---------------------------------------------------------------------*
*&      Form  DISPLAY_INVENTORY_LIST
*&---------------------------------------------------------------------*
FORM display_inventory_list USING it_inventory TYPE zcl_inventory_manager=>tty_inventory.
  DATA: ls_inventory TYPE zcl_inventory_manager=>ty_inventory.

  WRITE: / 'Inventory List'.
  WRITE: / '==============='.
  SKIP.

  WRITE: / 'Material' COLOR COL_HEADING,
         12 'Plant' COLOR COL_HEADING,
         22 'St.Loc' COLOR COL_HEADING,
         30 'Description' COLOR COL_HEADING,
         60 'Quantity' COLOR COL_HEADING,
         75 'Status' COLOR COL_HEADING.
  ULINE.

  LOOP AT it_inventory INTO ls_inventory.
    WRITE: / ls_inventory-material_id COLOR COL_NORMAL,
           12 ls_inventory-plant      COLOR COL_NORMAL,
           22 ls_inventory-storage_loc COLOR COL_NORMAL,
           30 ls_inventory-description COLOR COL_NORMAL,
           60 ls_inventory-quantity COLOR COL_NORMAL,
             ls_inventory-unit       COLOR COL_NORMAL,
           75 ls_inventory-status    COLOR COL_NORMAL.
  ENDLOOP.

  SKIP.
  WRITE: / 'Total items:', sy-tfill.
ENDFORM.
