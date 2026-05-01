"! <p class="shorttext synchronized">VSP Service Interface</p>
"! Interface for domain services in the VSP APC handler.
INTERFACE zif_vsp_service
  PUBLIC.

  TYPES:
    BEGIN OF ty_message,
      id      TYPE string,
      domain  TYPE string,
      action  TYPE string,
      params  TYPE string,
      timeout TYPE i,
    END OF ty_message,

    BEGIN OF ty_response,
      id      TYPE string,
      success TYPE abap_bool,
      data    TYPE string,
      error   TYPE string,
    END OF ty_response.

  "! Get the domain name this service handles
  METHODS get_domain
    RETURNING VALUE(rv_domain) TYPE string.

  "! Handle an incoming message
  METHODS handle_message
    IMPORTING iv_session_id     TYPE string
              is_message        TYPE ty_message
    RETURNING VALUE(rs_response) TYPE ty_response.

  "! Called when a session disconnects
  METHODS on_disconnect
    IMPORTING iv_session_id TYPE string.

ENDINTERFACE.
