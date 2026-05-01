*&---------------------------------------------------------------------*
*& Program: ZPROG_SBOOK_QUERY
*& Title  : 항공 예약 조회 프로그램 (ALV Refactored)
*&---------------------------------------------------------------------*
REPORT zprog_sbook_query.

*----------------------------------------------------------------------*
* CLASS lcl_report DEFINITION
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

    METHODS:
      run.

  PRIVATE SECTION.
    DATA: gt_bkgs TYPE TABLE OF ty_booking.

    METHODS:
      fetch_data,
      display_alv.
ENDCLASS.

*----------------------------------------------------------------------*
* GLOBAL DATA
*----------------------------------------------------------------------*
DATA: gs_ref TYPE sbook.

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
  PARAMETERS:     p_cancel AS CHECKBOX DEFAULT ' '.
SELECTION-SCREEN END OF BLOCK b2.

*----------------------------------------------------------------------*
* INITIALIZATION
*----------------------------------------------------------------------*
INITIALIZATION.
  %_s_carrid_%_app_%-text = '항공사 코드'.
  %_s_connid_%_app_%-text = '노선 번호'.
  %_s_fldate_%_app_%-text = '운항 날짜'.
  %_s_custid_%_app_%-text = '고객 ID'.
  %_s_class_%_app_%-text  = '좌석 등급'.
  %_p_cancel_%_app_%-text = '취소 건 포함'.

*----------------------------------------------------------------------*
* CLASS lcl_report IMPLEMENTATION
*----------------------------------------------------------------------*
CLASS lcl_report IMPLEMENTATION.

  METHOD run.
    fetch_data( ).
    IF gt_bkgs IS INITIAL.
      MESSAGE '조회 결과가 없습니다.' TYPE 'S' DISPLAY LIKE 'W'.
    ELSE.
      display_alv( ).
    ENDIF.
  ENDMETHOD.

  METHOD fetch_data.
    CALL FUNCTION 'SAPGUI_PROGRESS_INDICATOR'
      EXPORTING
        text = '데이터를 조회 중입니다...'.

    SELECT
        bk~carrid, ca~carrname, bk~connid, bk~fldate,
        pf~cityfrom, pf~cityto, bk~bookid, bk~customid,
        cu~name AS custname, bk~class, bk~custtype, bk~smoker,
        bk~luggweight, bk~wunit, bk~forcuram, bk~forcurkey,
        bk~order_date, bk~cancelled, bk~passname
      FROM sbook AS bk
        INNER JOIN scarr   AS ca ON ca~carrid = bk~carrid
        INNER JOIN spfli   AS pf ON pf~carrid = bk~carrid
                                AND pf~connid = bk~connid
        INNER JOIN scustom AS cu ON cu~id     = bk~customid
      WHERE bk~carrid   IN @s_carrid
        AND bk~connid   IN @s_connid
        AND bk~fldate   IN @s_fldate
        AND bk~customid IN @s_custid
        AND bk~class    IN @s_class
        AND ( @p_cancel = @abap_true OR bk~cancelled = @abap_false )
      ORDER BY bk~carrid, bk~fldate, bk~connid, bk~bookid
      INTO TABLE @gt_bkgs.

  ENDMETHOD.

  METHOD display_alv.
    DATA: lo_alv       TYPE REF TO cl_salv_table,
          lo_columns   TYPE REF TO cl_salv_columns_table,
          lo_column    TYPE REF TO cl_salv_column_table.

    TRY.
        cl_salv_table=>factory(
          IMPORTING r_salv_table = lo_alv
          CHANGING  t_table      = gt_bkgs ).

        lo_alv->get_functions( )->set_all( abap_true ).
        lo_alv->get_display_settings( )->set_list_header( '항공 예약 조회 리포트' ).
        lo_alv->get_display_settings( )->set_striped_pattern( abap_true ).

        lo_columns = lo_alv->get_columns( ).
        lo_columns->set_optimize( abap_true ).

        " Set column texts for joined fields
        TRY.
            lo_column ?= lo_columns->get_column( 'CARRNAME' ).
            lo_column->set_long_text( '항공사명' ).
            lo_column->set_medium_text( '항공사명' ).
            lo_column->set_short_text( '항공사명' ).

            lo_column ?= lo_columns->get_column( 'CUSTNAME' ).
            lo_column->set_long_text( '고객명' ).
            lo_column->set_medium_text( '고객명' ).
            lo_column->set_short_text( '고객명' ).
          CATCH cx_salv_not_found.
        ENDTRY.

        lo_alv->display( ).

      CATCH cx_salv_msg INTO DATA(lx).
        MESSAGE lx->get_text( ) TYPE 'E'.
    ENDTRY.
  ENDMETHOD.

ENDCLASS.

*----------------------------------------------------------------------*
* START-OF-SELECTION
*----------------------------------------------------------------------*
START-OF-SELECTION.
  NEW lcl_report( )->run( ).
