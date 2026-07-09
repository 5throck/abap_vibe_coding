# 재고관리 프로그램 (Inventory Management System)

## 개요 (Overview)
이 재고관리 시스템은 SAP ABAP으로 개발된 완전한 재고관리 솔루션입니다. 자재 입출고, 재고 조회, 최소/최대 재고 설정 등의 기능을 제공합니다.

This is a complete inventory management system developed in SAP ABAP. It provides functionality for material receipts/issues, inventory lookup, and min/max stock settings.

## 구성요소 (Components)

### 1. 데이터베이스 테이블 (Database Table)
**ZINV_STOCK** - 재고 마스터 테이블
- 자재 ID, 플랜트, 저장소 위치를 기본 키로 사용
- 현재 수량, 단위, 카테고리, 최소/최대 재고 레벨 저장
- 상태 관리 (활성/비활성/삭제)
- 생성/변경 정보 추적

### 2. 비즈니스 로직 클래스 (Business Logic Class)
**ZCL_INVENTORY_MANAGER** - 재고관리 비즈니스 로직
Methods:
- `add_stock()` - 재고 추가
- `withdraw_stock()` - 재고 차감
- `get_current_stock()` - 현재 재고 조회
- `check_stock_availability()` - 재고 가용성 확인
- `set_min_max_stock()` - 최소/최대 재고 설정
- `create_new_item()` - 신규 자재 등록
- `get_all_inventory()` - 전체 재고 목록
- `get_low_stock_items()` - 저재고 항목 조회

### 3. 메인 프로그램 (Main Program)
**ZPROG_INVENTORY_MANAGER** - 사용자 인터페이스
Actions:
- **C** (Create) - 신규 자재 등록
- **D** (Display) - 자재 정보 조회
- **A** (Add) - 재고 입고
- **R** (Reduce) - 재고 출고
- **M** (Modify) - 자재 정보 수정
- **X** (Delete) - 자재 삭제 (논리적 삭제)
- **L** (List) - 전체 재고 목록
- **S** (Low Stock) - 저재고 항목 조회
- **E** (Exit) - 프로그램 종료

### 4. 메시지 클래스 (Message Class)
**ZINV** - 시스템 메시지
- 오류 메시지 (001-099)
- 성공 메시지 (005-016)
- 경고 메시지 (050-059)
- 정보 메시지 (100-103)

## 기능 설명 (Features)

### 재고 입고 (Goods Receipt)
- 자재별 수량 추가
- 변경 내역 추적 (사용자, 시간)
- 단위 변환 지원

### 재고 출고 (Goods Issue)
- 현재 재고 확인 후 차감
- 재고 부족 시 오류 처리
- 변경 내역 추적

### 재고 조회 (Inventory Inquiry)
- 단일 자재 조회
- 전체 재고 목록
- 저재고 항목 필터링

### 재고 관리 (Inventory Management)
- 최소/최대 재고 레벨 설정
- 자재 정보 수정
- 논리적 삭제 (실제 데이터는 보존)

## 사용 방법 (Usage)

### 1. 프로그램 실행
```
T-Code: SA38 또는 SE38
Program: ZPROG_INVENTORY_MANAGER
Execute (F8)
```

### 2. 액션 선택 (Action Selection)
- Action: C, D, A, R, M, X, L, S, E

### 3. 자재 정보 입력 (Material Identification)
- Material ID: 자재 번호 (최대 20자)
- Plant: 플랜트 코드 (최대 10자)
- Storage Loc: 저장소 위치 (최대 10자)

### 4. 상세 정보 입력 (Details - for Create/Modify)
- Description: 자재 설명
- Quantity: 현재 수량
- Unit: 단위 (기본값: EA)
- Category: 카테고리
- Min Stock: 최소 재고
- Max Stock: 최대 재고

## 데이터 모델 (Data Model)

### Primary Key
- MANDT (Client)
- MATERIAL_ID (자재 ID)
- PLANT (플랜트)
- STORAGE_LOC (저장소 위치)

### Main Fields
- DESCRIPTION: 자재 설명
- QUANTITY: 현재 수량
- UNIT: 단위
- CATEGORY: 카테고리
- MIN_STOCK: 최소 재고
- MAX_STOCK: 최대 재고

### Audit Fields
- CREATED_BY: 생성자
- CREATED_AT: 생성일시
- CHANGED_BY: 변경자
- CHANGED_AT: 변경일시

### Status
- A (Active): 활성
- I (Inactive): 비활성
- D (Deleted): 삭제

## 확장 가능성 (Extensibility)

### 향후 추가 기능 (Future Enhancements)
1. 배치 입출고 처리
2. 재고 이동 내역 추적 (Movement History)
3. 예약 및 주문 연동
4. 바코드/스캔 기능
5. Fiori UI 개발
6. OData 서비스 노출
7. 재고 예측 및 MRP 연동

## 기술 사양 (Technical Specifications)

- Package: $TMP
- Language: ABAP
- System: SAP ERP (NPL, 7.52)
- Development Class: Local (Transport X)

## 주의사항 (Notes)

1. 이 프로그램은 데모/학습 목적으로 개발되었습니다.
2. 프로덕션 환경 사용 시 추가 검증 및 최적화가 필요합니다.
3. 권한 객체(Authorization Objects)를 추가하여 보안을 강화할 수 있습니다.
4. 대용량 데이터 처리 시 성능 최적화가 필요할 수 있습니다.

---
*Created: 2026-05-18*
*Developer: AI Agent (Claude)*
