# 재고관리 프로그램 SAP 시스템 적용 가이드
# Inventory Management System Deployment Guide

## 현재 상태 (Current Status)

ABAP 소스 파일들이 생성되었으나, **VSP MCP 서버가 설치되지 않아** 자동 생성이 불가능합니다.

The ABAP source files have been created, but the **VSP MCP server is not installed**, so automatic generation is not possible.

---

## 옵션 1: VSP 설치 (Option 1: Install VSP)

### VSP 다운로드 및 설치 (Download & Install VSP)

VSP는 SAP ABAP Development Tools (ADT)용 Go 기반 MCP 서버입니다.

#### macOS (Apple Silicon / Intel)

```bash
# 1. 최신 버전 다운로드
cd /Users/techcross/git/abap_vibe_coding
curl -L -o vsp-darwin.tar.gz https://github.com/oisee/vibing-steampunk/releases/latest/download/vsp-darwin-arm64.tar.gz

# 2. 압축 해제
tar -xzf vsp-darwin.tar.gz
chmod +x vsp

# 3. 설치 확인
./vsp system info
```

#### Windows

```powershell
# PowerShell 실행
cd C:\path\to\abap_vibe_coding

# 다운로드
Invoke-WebRequest -Uri "https://github.com/oisee/vibing-steampunk/releases/latest/download/vsp-windows-amd64.zip" -OutFile "vsp.zip"

# 압축 해제
Expand-Archive -Path vsp.zip -DestinationPath .

# 실행
.\vsp.exe system info
```

#### Linux

```bash
# 다운로드
wget https://github.com/oisee/vibing-steampunk/releases/latest/download/vsp-linux-amd64.tar.gz

# 압축 해제
tar -xzf vsp-linux-amd64.tar.gz
chmod +x vsp

# 실행
./vsp system info
```

### 설치 후 (After Installation)

```bash
# 시스템 연결 확인
./vsp --mode hyperfocused system info

# 자동 생성 시작
./vsp --mode hyperfocused write zinv_stock.tabl
./vsp --mode hyperfocused write zcl_inventory_manager.clas.abap
./vsp --mode hyperfocused write zinv_messages.tmsg.abap
./vsp --mode hyperfocused write zprog_inventory_manager.prog.abap
```

---

## 옵션 2: SAP GUI/ADT 사용 (Option 2: Use SAP GUI/ADT)

### ADT (ABAP Development Tools) 사용

#### Eclipse에 ADT가 설치되어 있다면:

1. **ABAP Project 열기**
   - Eclipse → File → Open ABAP Project
   - SAP 시스템 연결 정보 입력

2. **객체 생성**

**테이블 생성 (Create Table)**:
```
1. Project Explorer → 프로젝트 우클릭
2. New → Other ABAP Repository Object → Dictionary Objects → Database Table
3. Name: ZINV_STOCK
4. Package: $TMP
5. scratch/zinv_stock.tabl 내용 복사 & 붙여넣기
6. Activate (Ctrl+F3)
```

**클래스 생성 (Create Class)**:
```
1. Project Explorer → 프로젝트 우클릭
2. New → Other ABAP Repository Object → Source Code Library → Class
3. Name: ZCL_INVENTORY_MANAGER
4. Package: $TMP
5. scratch/zcl_inventory_manager.clas.abap 내용 복사 & 붙여넣기
6. Activate (Ctrl+F3)
```

**프로그램 생성 (Create Program)**:
```
1. Project Explorer → 프로젝트 우클릭
2. New → Other ABAP Repository Object → Source Code Library → Program
3. Name: ZPROG_INVENTORY_MANAGER
4. Package: $TMP
5. scratch/zprog_inventory_manager.prog.abap 내용 복사 & 붙여넣기
6. Activate (Ctrl+F3)
```

**메시지 클래스 생성 (Create Message Class)**:
```
1. SE38 T-Code 실행
2. 메뉴: Utilities → Messages → Message Maintenance
3. Message Class: ZINV
4. scratch/zinv_messages.tmsg.abap 내용으로 메시지 등록
5. Save
```

---

## 옵션 3: SAP GUI Transaction 사용 (Option 3: Use SAP GUI Transactions)

### SE11 (Data Dictionary)

**테이블 생성**:
```
1. SE11 T-Code 실행
2. Database Table: ZINV_STOCK
3. Create
4. Fields 탭에 필드 입력 (scratch/zinv_stock.tabl 참조)
5. Delivery Class: A
6. Data Browser/Table View Maint.: Display/Maintenance Allowed
7. Activate
```

### SE24 (Class Builder)

**클래스 생성**:
```
1. SE24 T-Code 실행
2. Class Name: ZCL_INVENTORY_MANAGER
3. Create
4. scratch/zcl_inventory_manager.clas.abap 내용 복사
5. Methods 탭에 메소드들 입력
6. Activate
```

### SE38 (ABAP Editor)

**프로그램 생성**:
```
1. SE38 T-Code 실행
2. Program Name: ZPROG_INVENTORY_MANAGER
3. Source Code 탭에 scratch/zprog_inventory_manager.prog.abap 내용 복사
4. Activate
```

### SE91 (Message Maintenance)

**메시지 클래스 생성**:
```
1. SE91 T-Code 실행
2. Message Class: ZINV
3. Create
4. Messages 탭에 메시지 번호별로 입력
5. Save
```

---

## 생성 후 작업 (Post-Creation Tasks)

### 1. 문법 체크 (Syntax Check)

```
SE38 → ZPROG_INVENTORY_MANAGER → Check (Ctrl+F2)
SE24 → ZCL_INVENTORY_MANAGER → Check
```

### 2. 프로그램 실행 (Execute Program)

```
SE38 → ZPROG_INVENTORY_MANAGER → Execute (F8)

Action 입력:
C - 신규 자재 등록
D - 자재 정보 조회
A - 재고 입고
R - 재고 출고
M - 자재 수정
X - 자재 삭제
L - 전체 목록
S - 저재고 목록
E - 종료
```

### 3. 테스트 시나리오 (Test Scenario)

```
[Step 1] 신규 자재 등록 (Create)
Action: C
Material ID: MAT001
Plant: 1000
Storage Loc: 0001
Description: Test Material
Quantity: 100
Unit: EA
Category: RAW
Min Stock: 10
Max Stock: 500

[Step 2] 자재 조회 (Display)
Action: D
Material ID: MAT001
Plant: 1000
Storage Loc: 0001
→ 결과 확인

[Step 3] 재고 입고 (Add Stock)
Action: A
Material ID: MAT001
Plant: 1000
Storage Loc: 0001
New Quantity: 50
→ 150으로 증가 확인

[Step 4] 재고 출고 (Reduce Stock)
Action: R
Material ID: MAT001
Plant: 1000
Storage Loc: 0001
New Quantity: 30
→ 120으로 감소 확인

[Step 5] 전체 목록 조회 (List)
Action: L
→ 전체 자재 목록 확인

[Step 6] 저재고 목록 조회 (Low Stock)
Action: S
→ Min Stock 미만 자재만 표시
```

---

## 문제 해결 (Troubleshooting)

### VSP 연결 오류

**에러**: "Connection refused" 또는 "CSRF token"
**해결**:
```
# SAP 시스템 상태 확인
./vsp system info

# 연결 정보 확인
# ADT URL 보통: http://vhcalnplci:50000
# Client: 001
# User: DEVELOPER
```

### 권한 오류 (Authorization Error)

**에러**: "No authorization"
**해결**: SAP Admin에게 다음 권한 요청
- S_DEVELOP (Development)
- S_TABU_DIS (Table Maintenance)
- S_TABLES (Table Display)

---

## 다음 단계 (Next Steps)

VSP 설치 완료 후, 자동으로 다음 작업이 수행됩니다:

1. ✅ SyntaxCheck - 문법 검증
2. ✅ RunUnitTests - 단위 테스트
3. ✅ RunATCCheck - ABAP Test Cockpit (코드 품질 검사)

현재까지 생성된 파일들:
```
scratch/
├── zinv_stock.tabl                  # 테이블 DDL
├── zcl_inventory_manager.clas.abap  # 비즈니스 로직 클래스
├── zprog_inventory_manager.prog.abap # 메인 프로그램
├── zprog_inventory_manager.prog.xml # 프로그램 메타데이터
├── zinv_messages.tmsg.abap           # 메시지 클래스
├── README_INVENTORY.md              # 사용 가이드
└── DEPLOYMENT_GUIDE.md              # 배포 가이드 (이 파일)
```

---

**문의사항**: VSP 설치 및 사용에 대해 추가 도움이 필요하시면 https://github.com/oisee/vibing-steampunk 문서를 참고하세요.
