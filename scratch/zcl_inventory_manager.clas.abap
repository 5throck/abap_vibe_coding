CLASS zcl_inventory_manager DEFINITION
  PUBLIC
  FINAL
  CREATE PUBLIC .

  PUBLIC SECTION.
    TYPES: BEGIN OF ty_inventory,
             material_id TYPE char20,
             plant       TYPE char10,
             storage_loc TYPE char10,
             description TYPE char40,
             quantity    TYPE menge_d,
             unit        TYPE meins,
             category    TYPE char10,
             min_stock   TYPE menge_d,
             max_stock   TYPE menge_d,
             status      TYPE char1,
           END OF ty_inventory.

    TYPES: tty_inventory TYPE STANDARD TABLE OF ty_inventory WITH EMPTY KEY.

    METHODS:
      constructor
        IMPORTING
          iv_material_id TYPE char20
          iv_plant       TYPE char10
          iv_storage_loc TYPE char10,

      add_stock
        IMPORTING
          iv_quantity TYPE menge_d
          iv_unit     TYPE meins
        RETURNING
          VALUE(rv_success) TYPE abap_bool
        RAISING
          cx_abap_invalid_value,

      withdraw_stock
        IMPORTING
          iv_quantity TYPE menge_d
          iv_unit     TYPE meins
        RETURNING
          VALUE(rv_success) TYPE abap_bool
        RAISING
          cx_abap_invalid_value,

      get_current_stock
        RETURNING
          VALUE(rs_inventory) TYPE ty_inventory,

      check_stock_availability
        IMPORTING
          iv_quantity TYPE menge_d
        RETURNING
          VALUE(rv_available) TYPE abap_bool,

      set_min_max_stock
        IMPORTING
          iv_min_stock TYPE menge_d
          iv_max_stock TYPE menge_d,

      update_description
        IMPORTING
          iv_description TYPE char40,

      set_status
        IMPORTING
          iv_status TYPE char1
        RAISING
          cx_abap_invalid_value,

      delete
        RETURNING
          VALUE(rv_success) TYPE abap_bool,

      get_all_inventory
        RETURNING
          VALUE(rt_inventory) TYPE tty_inventory,

      get_low_stock_items
        RETURNING
          VALUE(rt_inventory) TYPE tty_inventory.

    CLASS-METHODS:
      create_new_item
        IMPORTING
          is_inventory TYPE ty_inventory
        RETURNING
          VALUE(rv_success) TYPE abap_bool
        RAISING
          cx_abap_invalid_value.

  PROTECTED SECTION.

  PRIVATE SECTION.
    DATA: ms_material_key TYPE zinv_stock,
          mo_inventory     TYPE REF TO zinv_stock.

    METHODS:
      load_inventory,
      save_inventory
        RETURNING
          VALUE(rv_success) TYPE abap_bool,

      validate_quantity
        IMPORTING
          iv_quantity TYPE menge_d
        RETURNING
          VALUE(rv_valid) TYPE abap_bool.

    CONSTANTS:
      c_status_active   TYPE char1 VALUE 'A',
      c_status_inactive TYPE char1 VALUE 'I',
      c_status_deleted  TYPE char1 VALUE 'D'.

    CLASS-METHODS:
      validate_status
        IMPORTING
          iv_status     TYPE char1
        RETURNING
          VALUE(rv_valid) TYPE abap_bool.
ENDCLASS.


CLASS zcl_inventory_manager IMPLEMENTATION.

  METHOD constructor.
    ms_material_key-material_id = iv_material_id.
    ms_material_key-plant       = iv_plant.
    ms_material_key-storage_loc = iv_storage_loc.

    load_inventory( ).
  ENDMETHOD.

  METHOD load_inventory.
    SELECT SINGLE *
      FROM zinv_stock
      INTO @mo_inventory
      WHERE material_id = @ms_material_key-material_id
        AND plant       = @ms_material_key-plant
        AND storage_loc = @ms_material_key-storage_loc
        AND status      = @c_status_active.
  ENDMETHOD.

  METHOD add_stock.
    IF mo_inventory IS INITIAL.
      RAISE EXCEPTION TYPE cx_abap_invalid_value
        EXPORTING
          textid = cx_abap_invalid_value=>unknown_value
          previous = NEW cx_sy_open_sql_db( ).
    ENDIF.

    IF validate_quantity( iv_quantity ) = abap_false.
      RAISE EXCEPTION TYPE cx_abap_invalid_value
        EXPORTING
          textid = cx_abap_invalid_value=>unknown_value
          previous = NEW cx_sy_open_sql_db( ).
    ENDIF.

    mo_inventory-quantity = mo_inventory-quantity + iv_quantity.
    mo_inventory-changed_at = utclong_current( ).
    mo_inventory-changed_by  = sy-uname.

    rv_success = save_inventory( ).
  ENDMETHOD.

  METHOD withdraw_stock.
    IF mo_inventory IS INITIAL.
      RAISE EXCEPTION TYPE cx_abap_invalid_value
        EXPORTING
          textid = cx_abap_invalid_value=>unknown_value
          previous = NEW cx_sy_open_sql_db( ).
    ENDIF.

    IF validate_quantity( iv_quantity ) = abap_false.
      RAISE EXCEPTION TYPE cx_abap_invalid_value
        EXPORTING
          textid = cx_abap_invalid_value=>unknown_value
          previous = NEW cx_sy_open_sql_db( ).
    ENDIF.

    IF mo_inventory-quantity < iv_quantity.
      rv_success = abap_false.
      RETURN.
    ENDIF.

    mo_inventory-quantity = mo_inventory-quantity - iv_quantity.
    mo_inventory-changed_at = utclong_current( ).
    mo_inventory-changed_by  = sy-uname.

    rv_success = save_inventory( ).
  ENDMETHOD.

  METHOD get_current_stock.
    IF mo_inventory IS NOT INITIAL.
      rs_inventory-material_id  = mo_inventory-material_id.
      rs_inventory-plant        = mo_inventory-plant.
      rs_inventory-storage_loc  = mo_inventory-storage_loc.
      rs_inventory-description  = mo_inventory-description.
      rs_inventory-quantity     = mo_inventory-quantity.
      rs_inventory-unit         = mo_inventory-unit.
      rs_inventory-category     = mo_inventory-category.
      rs_inventory-min_stock    = mo_inventory-min_stock.
      rs_inventory-max_stock    = mo_inventory-max_stock.
      rs_inventory-status       = mo_inventory-status.
    ENDIF.
  ENDMETHOD.

  METHOD check_stock_availability.
    IF mo_inventory IS NOT INITIAL.
      rv_available = boolc( mo_inventory-quantity >= iv_quantity ).
    ENDIF.
  ENDMETHOD.

  METHOD set_min_max_stock.
    IF mo_inventory IS NOT INITIAL.
      mo_inventory-min_stock   = iv_min_stock.
      mo_inventory-max_stock   = iv_max_stock.
      mo_inventory-changed_at  = utclong_current( ).
      mo_inventory-changed_by   = sy-uname.

      save_inventory( ).
    ENDIF.
  ENDMETHOD.

  METHOD update_description.
    IF mo_inventory IS NOT INITIAL.
      mo_inventory-description  = iv_description.
      mo_inventory-changed_at   = utclong_current( ).
      mo_inventory-changed_by    = sy-uname.

      save_inventory( ).
    ENDIF.
  ENDMETHOD.

  METHOD set_status.
    IF validate_status( iv_status ) = abap_false.
      RAISE EXCEPTION TYPE cx_abap_invalid_value
        EXPORTING
          textid = cx_abap_invalid_value=>unknown_value
          previous = NEW cx_sy_open_sql_db( ).
    ENDIF.

    IF mo_inventory IS NOT INITIAL.
      mo_inventory-status     = iv_status.
      mo_inventory-changed_at = utclong_current( ).
      mo_inventory-changed_by = sy-uname.

      save_inventory( ).
    ENDIF.
  ENDMETHOD.

  METHOD delete.
    IF mo_inventory IS NOT INITIAL.
      mo_inventory-status     = c_status_deleted.
      mo_inventory-changed_at = utclong_current( ).
      mo_inventory-changed_by = sy-uname.

      rv_success = save_inventory( ).
    ENDIF.
  ENDMETHOD.

  METHOD get_all_inventory.
    SELECT material_id, plant, storage_loc, description, quantity, unit,
           category, min_stock, max_stock, status
      FROM zinv_stock
      INTO TABLE @rt_inventory
      WHERE status = @c_status_active
      ORDER BY plant, storage_loc, material_id.
  ENDMETHOD.

  METHOD get_low_stock_items.
    SELECT material_id, plant, storage_loc, description, quantity, unit,
           category, min_stock, max_stock, status
      FROM zinv_stock
      INTO TABLE @rt_inventory
      WHERE status = @c_status_active
        AND quantity < min_stock
      ORDER BY plant, storage_loc, material_id.
  ENDMETHOD.

  METHOD create_new_item.
    DATA: ls_inventory TYPE zinv_stock.

    ls_inventory-material_id  = is_inventory-material_id.
    ls_inventory-plant        = is_inventory-plant.
    ls_inventory-storage_loc  = is_inventory-storage_loc.
    ls_inventory-description  = is_inventory-description.
    ls_inventory-quantity     = is_inventory-quantity.
    ls_inventory-unit         = is_inventory-unit.
    ls_inventory-category     = is_inventory-category.
    ls_inventory-min_stock    = is_inventory-min_stock.
    ls_inventory-max_stock    = is_inventory-max_stock.
    ls_inventory-status       = c_status_active.
    ls_inventory-created_at   = utclong_current( ).
    ls_inventory-created_by   = sy-uname.
    ls_inventory-changed_at   = utclong_current( ).
    ls_inventory-changed_by   = sy-uname.

    INSERT zinv_stock FROM ls_inventory.

    IF sy-subrc = 0.
      rv_success = abap_true.
    ELSE.
      rv_success = abap_false.
    ENDIF.
  ENDMETHOD.

  METHOD save_inventory.
    IF mo_inventory IS NOT INITIAL.
      UPDATE zinv_stock FROM mo_inventory.

      IF sy-subrc = 0.
        rv_success = abap_true.
      ELSE.
        rv_success = abap_false.
      ENDIF.
    ENDIF.
  ENDMETHOD.

  METHOD validate_quantity.
    rv_valid = boolc( iv_quantity > 0 ).
  ENDMETHOD.

  METHOD validate_status.
    rv_valid = boolc( iv_status = c_status_active OR
                      iv_status = c_status_inactive OR
                      iv_status = c_status_deleted ).
  ENDMETHOD.

ENDCLASS.
