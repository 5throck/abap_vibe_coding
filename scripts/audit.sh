#!/bin/bash
# scripts/audit.sh
# Documentation audit — called by sync-md.sh after every Write/Edit.
# Intentionally omits 'set -e' — runs all checks to report every issue at once.

FAILED=0
echo "--- Documentation Audit ---"

# Paths excluded from all audit checks (temporary/generated files)
AUDIT_EXCLUDE="node_modules|\.git|\.claude|\.gemini|scratch/temp|scratch/tasks|memory/|docs/superpowers/"

# 1. Absolute Path Check
ABS_PATHS=$(grep -rEi "[A-Z]:\\\\|/Users/|/home/" . --include="*.md" | grep -vE "$AUDIT_EXCLUDE|setup-guide.md|antigravity-setup.md|plugin-setup.md")
if [ -n "$ABS_PATHS" ]; then
    echo "  [!] Absolute paths detected!"
    echo "$ABS_PATHS" | head -n 5
    FAILED=1
fi

# 2. Link Integrity & Path Style Check
while read -r file; do
    if grep -q '\[.*\](.*\\.*)' "$file"; then
        echo "  [!] Cross-Platform: Backslash found in link in $file. Use forward slashes (/) for compatibility."
        FAILED=1
    fi

    links=$(grep -o '\[.*\]([^#)]*)' "$file" | sed -E 's/.*\]\(([^# )]+)\).*/\1/' | grep -vE "^http|^mailto:|^#|YYYY-MM-DD|\.\./\.\.")
    for link in $links; do
        decoded_link=$(echo "$link" | sed 's/%20/ /g')
        dir=$(dirname "$file")
        target="$dir/$decoded_link"
        if [ ! -e "$target" ]; then
            echo "  [!] Broken link in $file -> $link"
            FAILED=1
        fi
    done
done < <(find . -name "*.md" \
  -not -path "*/node_modules/*" \
  -not -path "*/.git/*" \
  -not -path "*/.claude/*" \
  -not -path "*/.gemini/*" \
  -not -path "*/scratch/temp/*" \
  -not -path "*/scratch/tasks/*" \
  -not -path "*/memory/*" \
  -not -path "*/docs/superpowers/*")

# 3. Script Pairing Check (all scripts must have both .ps1 and .sh)
for script in scripts/*; do
    base=$(basename "$script" | sed 's/\.[^.]*$//')
    if [[ "$script" == *.sh ]]; then
        if [ ! -f "scripts/$base.ps1" ]; then
            echo "  [!] Cross-Platform: Missing .ps1 pair for '$base.sh'"
            FAILED=1
        fi
    elif [[ "$script" == *.ps1 ]]; then
        if [ ! -f "scripts/$base.sh" ]; then
            echo "  [!] Cross-Platform: Missing .sh pair for '$base.ps1'"
            FAILED=1
        fi
    fi
done

# 4. Redundancy Check
if [ -f "CLAUDE.md" ] && [ -f "GEMINI.md" ]; then
    if diff "CLAUDE.md" "GEMINI.md" > /dev/null; then
        echo "  [!] Redundancy: CLAUDE.md and GEMINI.md are identical."
    fi
fi

# 5. MCP Config Prefix Consistency Check
for cfg in .mcp.json .codex/config.toml .gemini/settings.json; do
    if [ -f "$cfg" ]; then
        if grep -qE "VSP_MODE|VSP_ALLOWED_PACKAGES|VSP_FEATURE_" "$cfg"; then
            echo "  [!] Prefix inconsistency in $cfg: found VSP_* env vars — use SAP_* prefix instead."
            FAILED=1
        fi
    fi
done

# 6. vsp binary version
echo ""
echo "[Check 6] vsp binary version"
VSP_PATH="$(dirname "$0")/../vsp.exe"
if [ -f "$VSP_PATH" ]; then
    VSP_VERSION=$("$VSP_PATH" --version 2>&1)
    if [ -n "$VSP_VERSION" ]; then
        echo "  vsp version: $VSP_VERSION"
    else
        echo "  WARNING: vsp binary found but --version returned no output"
    fi
else
    echo "  FAIL: vsp.exe not found at $VSP_PATH"
    FAILED=1
fi

# 9. Active CRITICAL security advisories (warn only — does not fail audit)
if [ -d "security" ] && ls security/*.md 2>/dev/null | grep -q .; then
  _critical=0
  for _f in security/*.md; do
    [ -f "$_f" ] || continue
    if grep -q "^severity: CRITICAL" "$_f" && grep -q "^status: active" "$_f"; then
      _critical=$((_critical + 1))
    fi
  done
  if [ "$_critical" -gt 0 ]; then
    echo -e "\033[33m[WARN]\033[0m security/: $_critical active CRITICAL advisory/advisories — run /security-check to review"
  fi
fi

if [ $FAILED -ne 0 ]; then
    echo "Audit FAILED."
    exit 1
fi

echo "Audit PASSED."
exit 0
