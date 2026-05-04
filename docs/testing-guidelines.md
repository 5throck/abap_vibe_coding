# QA and Testing Guidelines

This document provides standards for writing ABAP Unit tests within the Harness Engineering framework. The **🧪 QA Engineer** agent should refer to this guide when creating or updating test classes.

## 1. Test Class Structure

All test classes should be created as local classes within the global class or program they are testing. They should follow the standard ABAP Unit definitions.

### Required Class Definition
```abap
CLASS ltc_test_class DEFINITION FOR TESTING
  RISK LEVEL HARMLESS
  DURATION SHORT.

  PRIVATE SECTION.
    DATA: cut TYPE REF TO zcl_my_class. " Class Under Test (CUT)

    " Setup and Teardown methods
    CLASS-METHODS: class_setup.    " Run once before any test in the class
    CLASS-METHODS: class_teardown. " Run once after all tests in the class
    METHODS: setup.                " Run before each test method
    METHODS: teardown.             " Run after each test method

    " Test methods
    METHODS: test_method_name FOR TESTING.

ENDCLASS.
```

## 2. Test Isolation & Mocking

ABAP Unit tests must not depend on actual database records unless running an integration test. To mock database queries or external dependencies, use **TEST-SEAMS**.

### Using TEST-SEAMS
When writing the main implementation logic, wrap database selections or external calls in a test seam:

```abap
" Inside the Class Under Test (CUT)
TEST-SEAM select_data.
  SELECT * FROM sflight INTO TABLE @lt_sflight WHERE carrid = @iv_carrid.
END-TEST-SEAM.
```

### Injecting Mocks
In the test class, use `TEST-INJECTION` to provide mock data. Typically, this is done in the `setup` method or directly within the test method if specific data is needed.

```abap
" Inside the Test Class
METHOD test_method_name.
  " Arrange: Inject mock data
  TEST-INJECTION select_data.
    lt_sflight = VALUE #( ( carrid = 'LH' connid = '0400' price = 500 ) ).
  END-TEST-INJECTION.

  " Act: Call the method under test
  DATA(result) = cut->get_flights( 'LH' ).

  " Assert: Verify the result
  cl_abap_unit_assert=>assert_equals(
    act = lines( result )
    exp = 1
    msg = 'Should return exactly 1 flight' ).
ENDMETHOD.
```

## 3. Best Practices

- **Naming Conventions**: Test methods should start with `test_` and clearly describe what is being tested (e.g., `test_calc_discount_valid`).
- **Setup Method**: Always initialize the `cut` (Class Under Test) inside the `setup` method to ensure a fresh instance for every test.
- **Assertions**: Use `cl_abap_unit_assert` exclusively. Provide meaningful messages (`msg` parameter) for assertions to help diagnose failures quickly.
- **Coverage**: Aim to test both positive (happy path) and negative (error handling/exceptions) scenarios.

---
*Maintained by the Harness Engineering Team | Last Updated: 2026-05-04*
