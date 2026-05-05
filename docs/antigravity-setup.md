# Antigravity MCP Setup Guide

Antigravity는 VS Code 확장으로 실행되는 AI 코딩 도우미입니다. 프로젝트 레벨 설정 파일을 지원하지 않기 때문에 **사용자 수준(user-level)**에서 MCP 서버를 직접 등록해야 합니다.

> **주의사항**:
> - Antigravity는 `PostToolUse` 훅을 지원하지 않습니다. Post-Write 체인(`/post-write`)을 매번 수동으로 실행해야 합니다.
> - 이 가이드의 설정은 각 개발자가 개인 VS Code 환경에서 수행해야 합니다 (팀 공유 불가).

---

## 1. 사전 요건

- VS Code 설치
- Antigravity 확장 설치 및 활성화
- `vsp` 바이너리가 `C:\git\abap\vsp.exe` (Windows) 또는 `/path/to/vsp` (macOS/Linux)에 존재
- `.env` 파일이 `C:\git\abap\.env`에 설정 완료

---

## 2. MCP 서버 등록

Antigravity의 MCP 서버 설정은 VS Code의 `settings.json` (사용자 설정)에 등록합니다.

**VS Code 사용자 settings.json 열기:**
- 명령 팔레트 (`Ctrl+Shift+P` / `Cmd+Shift+P`) → `Preferences: Open User Settings (JSON)`

**아래 내용을 추가:**

```json
{
  "antigravity.mcpServers": {
    "abap": {
      "command": "C:\\git\\abap\\vsp.exe",
      "args": ["--mode", "hyperfocused"],
      "env": {
        "VSP_MODE": "hyperfocused",
        "VSP_ALLOWED_PACKAGES": "Z*,$TMP,$ZADT_VSP,$VSP_ADT",
        "VSP_FEATURE_ABAPGIT": "on",
        "VSP_FEATURE_TRANSPORT": "on",
        "VSP_FEATURE_UI5": "on",
        "VSP_FEATURE_RAP": "on"
      }
    },
    "abap-docs": {
      "type": "http",
      "url": "https://mcp-abap.marianzeis.de/mcp"
    },
    "sap-docs": {
      "type": "http",
      "url": "https://mcp-sap-docs.marianzeis.de/mcp"
    }
  }
}
```

> **macOS/Linux**: `command` 경로를 `/path/to/your/repo/vsp`로 변경하세요.

---

## 3. 환경 변수 설정

`vsp`는 SAP 연결 정보를 환경 변수에서 읽습니다. Antigravity가 `.env` 파일을 자동으로 로드하지 않는 경우, `env` 항목에 직접 추가하거나 시스템 환경 변수로 설정합니다.

**Windows (시스템 환경 변수):**
```powershell
[System.Environment]::SetEnvironmentVariable("VSP_BASE_URL", "http://vhcalnplci:50000", "User")
[System.Environment]::SetEnvironmentVariable("VSP_USER", "your-sap-user", "User")
[System.Environment]::SetEnvironmentVariable("VSP_PASSWORD", "your-sap-password", "User")
[System.Environment]::SetEnvironmentVariable("VSP_CLIENT", "001", "User")
```

**macOS/Linux (~/.bashrc 또는 ~/.zshrc):**
```bash
export VSP_BASE_URL="http://vhcalnplci:50000"
export VSP_USER="your-sap-user"
export VSP_PASSWORD="your-sap-password"
export VSP_CLIENT="001"
```

---

## 4. 검증

VS Code를 재시작한 후 Antigravity 채팅창에서 확인:

```
Show SAP system info
```

응답에 시스템 ID, 클라이언트, 사용자 정보가 표시되면 연결 성공입니다.

---

## 5. 훅 미지원 대응: 수동 Post-Write 체인

Antigravity에서는 파일 편집 후 훅이 자동으로 실행되지 않습니다.  
ABAP 코드를 수정한 뒤 **반드시 아래 체인을 수동으로 실행**해야 합니다:

1. **SyntaxCheck** — 수정한 ABAP 오브젝트의 문법 오류 확인
2. **RunUnitTests** — 패키지의 단위 테스트 실행
3. **RunATCCheck** — ATC 정적 분석 실행

Antigravity 채팅에서 직접 요청하거나, Claude Code CLI에서 `/post-write <오브젝트명>`을 실행하세요.

또한 Git 커밋/동기화는 터미널에서 수동으로 수행해야 합니다:

```bash
bash scripts/vsp-sync.sh "feat: 변경 내용 요약"
# 또는 Windows PowerShell:
.\scripts\vsp-sync.ps1 -Message "feat: 변경 내용 요약"
```

---

## 6. 작업 흐름 요약

| 단계 | Claude Code CLI | Claude Code App | Gemini CLI | Antigravity |
|------|:-:|:-:|:-:|:-:|
| MCP 자동 연결 | ✅ | ✅ | ✅ | ✅ (수동 등록) |
| PostToolUse 훅 | ✅ | ❌ | ✅ | ❌ |
| Post-Write 체인 | 자동 | 수동(`/post-write`) | 자동 | 수동 |
| Git 커밋 | `/sync` | `/sync` | 수동 | 수동 |

---

*Last Updated: 2026-05-05*
