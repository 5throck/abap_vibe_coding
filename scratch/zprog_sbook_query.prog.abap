*&---------------------------------------------------------------------*
*& Program: ZPROG_SBOOK_QUERY
*& Title  : Flight Booking Query (ALV - OO Refactored v2)
*&---------------------------------------------------------------------*
REPORT zprog_sbook_query.

*----------------------------------------------------------------------*
* LOCAL CLASS DEFINITION
*----------------------------------------------------------------------*
CLASS lcl_report DEFINITION FINAL.
  PUBLIC SECTION.
    TYPES: BEGIN OF ty_booking,
             carrid     TYPE sbook-carrid,
             carrname   TYPE scarr-carrname,
             connid     TYPE sbook-connid,
             fldate     TYPE sbook-fldate,
             cityfrom   TYPE spfli-cityfrom,
             cityto     TYPE spfli-cityto,
             bookid     TYPE sbook-bookid,
             customid   TYPE sbook-customid,
             custname   TYPE scustom-name,
             class      TYPE sbook-class,
             custtype   TYPE sbook-custtype,
             smoker     TYPE sbook-smoker,
             luggweight TYPE sbook-luggweight,
             wunit      TYPE sbook-wunit,
             forcuram   TYPE sbook-forcuram,
             forcurkey  TYPE sbook-forcurkey,
             order_date TYPE sbook-order_date,
             cancelled  TYPE sbook-cancelled,
             passname   TYPE sbook-passname,
           END OF ty_booking.

    METHODS run.

  PRIVATE SECTION.
    DATA gt_bkgs TYPE TABLE OF ty_booking.

    METHODS:
      fetch_data,
      display_alv,
      set_col_text
        IMPORTING io_columns  TYPE REF TO cl_salv_columns_table
                  iv_col_name TYPE lvc_fname
                  iv_long     TYPE scrtext_l
                  iv_mid      TYPE scrtext_m
                  iv_short    TYPE scrtext_s.
ENDCLASS.

*----------------------------------------------------------------------*
* GLOBAL REFERENCE DATA (for SELECT-OPTIONS)
*----------------------------------------------------------------------*
DATA gs_ref TYPE sbook.

*----------------------------------------------------------------------*
* SELECTION SCREEN
*----------------------------------------------------------------------*
SELECTION-SCREEN BEGIN OF BLOCK b1 WITH FRAME TITLE TEXT-t01.
  SELECT-OPTIONS: s_carrid FOR gs_ref-carrid,
                  s_connid FOR gs_ref-connid,
                  s_fldate FOR gs_ref-fldate DEFAULT sy-datum.
SELECTION-SCREEN END OF BLOCK b1.

SELECTION-SCREEN BEGIN OF BLOCK b2 WITH FRAME TITLE TEXT-t02.
  SELECT-OPTIONS: s_custid FOR gs_ref-customid,
                  s_class  FOR gs_ref-class.
  PARAMETERS: p_cancel AS CHECKBOX DEFAULT ' '.
SELECTION-SCREEN END OF BLOCK b2.

*----------------------------------------------------------------------*
* INITIALIZATION
*----------------------------------------------------------------------*
INITIALIZATION.
  %_s_carrid_%_app_%-text = TEXT-l01.
  %_s_connid_%_app_%-text = TEXT-l02.
  %_s_fldate_%_app_%-text = TEXT-l03.
  %_s_custid_%_app_%-text = TEXT-l04.
  %_s_class_%_app_%-text  = TEXT-l05.
  %_p_cancel_%_app_%-text = TEXT-l06.

*----------------------------------------------------------------------*
* CLASS IMPLEMENTATION
*----------------------------------------------------------------------*
CLASS lcl_report IMPLEMENTATION.

  METHOD run.
    fetch_data( ).
    IF gt_bkgs IS INITIAL.
      MESSAGE TEXT-m01 TYPE 'S' DISPLAY LIKE 'W'.
    ELSE.
      display_alv( ).
    ENDIF.
  ENDMETHOD.

  METHOD fetch_data.
    CALL FUNCTION 'SAPGUI_PROGRESS_INDICATOR'
      EXPORTING
        text = TEXT-p01.

    SELECT bk~carrid, ca~carrname, bk~connid, bk~fldate,
           pf~cityfrom, pf~cityto, bk~bookid, bk~customid,
           cu~name AS custname, bk~class, bk~custtype, bk~smoker,
           bk~luggweight, bk~wunit, bk~forcuram, bk~forcurkey,
           bk~order_date, bk~cancelled, bk~passname
      FROM sbook AS bk
      INNER JOIN scarr   AS ca ON ca~carrid = bk~carrid
      INNER JOIN spfli   AS pf ON pf~carrid = bk~carrid
                               AND pf~connid = bk~connid
      INNER JOIN scustom AS cu ON cu~id = bk~customid
      WHERE bk~carrid   IN @s_carrid
        AND bk~connid   IN @s_connid
        AND bk~fldate   IN @s_fldate
        AND bk~customid IN @s_custid
        AND bk~class    IN @s_class
        AND ( @p_cancel = @abap_true OR bk~cancelled = @abap_false )
      ORDER BY bk~carrid, bk~fldate, bk~connid, bk~bookid
      INTO TABLE @gt_bkgs.
  ENDMETHOD.

  METHOD set_col_text.
    TRY.
        DATA(lo_col) = CAST cl_salv_column_table(
                         io_columns->get_column( iv_col_name ) ).
        lo_col->set_long_text( iv_long ).
        lo_col->set_medium_text( iv_mid ).
        lo_col->set_short_text( iv_short ).
      CATCH cx_salv_not_found cx_sy_move_cast_error.
    ENDTRY.
  ENDMETHOD.

  METHOD display_alv.
    DATA lo_alv TYPE REF TO cl_salv_table.

    TRY.
        cl_salv_table=>factory(
          IMPORTING r_salv_table = lo_alv
          CHANGING  t_table      = gt_bkgs ).

        lo_alv->get_functions( )->set_all( abap_true ).
        lo_alv->get_display_settings( )->set_list_header( TEXT-h01 ).
        lo_alv->get_display_settings( )->set_striped_pattern( abap_true ).

        DATA(lo_columns) = lo_alv->get_columns( ).
        lo_columns->set_optimize( abap_true ).

        set_col_text( io_columns  = lo_columns
                      iv_col_name = 'CARRNAME'
                      iv_long     = TEXT-c01
                      iv_mid      = TEXT-c01
                      iv_short    = TEXT-c01 ).
        set_col_text( io_columns  = lo_columns
                      iv_col_name = 'CUSTNAME'
                      iv_long     = TEXT-c02
                      iv_mid      = TEXT-c02
                      iv_short    = TEXT-c02 ).
        set_col_text( io_columns  = lo_columns
                      iv_col_name = 'CITYFROM'
                      iv_long     = TEXT-c03
                      iv_mid      = TEXT-c03
                      iv_short    = TEXT-c03 ).
        set_col_text( io_columns  = lo_columns
                      iv_col_name = 'CITYTO'
                      iv_long     = TEXT-c04
                      iv_mid      = TEXT-c04
                      iv_short    = TEXT-c04 ).
        set_col_text( io_columns  = lo_columns
                      iv_col_name = 'FLDATE'
                      iv_long     = TEXT-c05
                      iv_mid      = TEXT-c05
                      iv_short    = TEXT-c05 ).

        lo_alv->get_sorts( )->add_sort( columnname = 'FLDATE' ).

        lo_alv->display( ).

      CATCH cx_salv_msg
            cx_salv_not_found
            cx_salv_existing
            cx_salv_data_error INTO DATA(lx).
        MESSAGE lx->get_text( ) TYPE 'E'.
    ENDTRY.
  ENDMETHOD.

ENDCLASS.

*----------------------------------------------------------------------*
* START-OF-SELECTION
*----------------------------------------------------------------------*
START-OF-SELECTION.
  NEW lcl_report( )->run( ).