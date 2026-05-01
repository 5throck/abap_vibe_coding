"! <p class="shorttext synchronized">VSP RFC Service</p>
"! Enables dynamic RFC/BAPI calls via WebSocket.
"! Actions: search, ping
CLASS zcl_vsp_rfc_service DEFINITION
  PUBLIC
  FINAL
  CREATE PUBLIC.

  PUBLIC SECTION.
    INTERFACES zif_vsp_service.

  PRIVATE SECTION.
    METHODS handle_search
      IMPORTING is_message         TYPE zif_vsp_service=>ty_message
      RETURNING VALUE(rs_response) TYPE zif_vsp_service=>ty_response.

    METHODS handle_ping
      IMPORTING is_message         TYPE zif_vsp_service=>ty_message
      RETURNING VALUE(rs_response) TYPE zif_vsp_service=>ty_response.

    METHODS extract_param
      IMPORTING iv_params       TYPE string
                iv_name         TYPE string
      RETURNING VALUE(rv_value) TYPE string.

ENDCLASS.


CLASS zcl_vsp_rfc_service IMPLEMENTATION.

  METHOD zif_vsp_service~get_domain.
    rv_domain = 'rfc'.
  ENDMETHOD.

  METHOD zif_vsp_service~handle_message.
    CASE is_message-action.
      WHEN 'search'.
        rs_response = handle_search( is_message ).
      WHEN 'ping'.
        rs_response = handle_ping( is_message ).
      WHEN OTHERS.
        rs_response = VALUE #(
          id      = is_message-id
          success = abap_false
          error   = '{"code":"UNKNOWN_ACTION","message":"Action not supported"}'
        ).
    ENDCASE.
  ENDMETHOD.

  METHOD zif_vsp_service~on_disconnect.
  ENDMETHOD.

  METHOD handle_search.
    DATA lv_pattern TYPE string.
    lv_pattern = extract_param( iv_params = is_message-params iv_name = 'pattern' ).
    IF lv_pattern IS INITIAL.
      lv_pattern = '%'.
    ENDIF.
    TRANSLATE lv_pattern TO UPPER CASE.
    REPLACE ALL OCCURRENCES OF '*' IN lv_pattern WITH '%'.

    DATA lt_funcs TYPE STANDARD TABLE OF rs38l_fnam.
    SELECT funcname FROM tfdir INTO TABLE lt_funcs
      UP TO 100 ROWS
      WHERE funcname LIKE lv_pattern
      ORDER BY funcname.

    DATA lv_json TYPE string.
    DATA lv_first TYPE abap_bool.

    lv_json = '['.
    lv_first = abap_true.
    LOOP AT lt_funcs INTO DATA(lv_func).
      IF lv_first = abap_false.
        CONCATENATE lv_json ',' INTO lv_json.
      ENDIF.
      CONCATENATE lv_json '{"name":"' lv_func '"}' INTO lv_json.
      lv_first = abap_false.
    ENDLOOP.
    CONCATENATE lv_json ']' INTO lv_json.

    rs_response = VALUE #(
      id      = is_message-id
      success = abap_true
      data    = lv_json
    ).
  ENDMETHOD.

  METHOD handle_ping.
    DATA lv_ts TYPE string.
    lv_ts = sy-datum && sy-uzeit.
    rs_response = VALUE #(
      id      = is_message-id
      success = abap_true
      data    = '{"pong":true,"timestamp":"' && lv_ts && '"}'
    ).
  ENDMETHOD.

  METHOD extract_param.
    DATA lv_regex TYPE string.
    CONCATENATE '"' iv_name '":' INTO lv_regex.
    DATA lv_pos TYPE i.
    FIND lv_regex IN iv_params MATCH OFFSET lv_pos.
    IF sy-subrc = 0.
      DATA lv_rest TYPE string.
      lv_rest = iv_params+lv_pos.
      FIND REGEX ':\s*"([^"]*)"' IN lv_rest SUBMATCHES rv_value.
    ENDIF.
  ENDMETHOD.

ENDCLASS.
