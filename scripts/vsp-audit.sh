#!/bin/bash
# scripts/vsp-audit.sh
# Cross-platform documentation audit (Unix: macOS/Linux)

FAILED=0
echo "--- Documentation Audit (Unix) ---"

# 1. Absolute Path Check
ABS_PATHS=$(grep -rEi "[A-Z]:\\\\|/Users/|/home/" . --include="*.md" | grep -vE "node_modules|\.git|\.claude|\.gemini|setup-guide.md|antigravity-setup.md")
if [ -n "$ABS_PATHS" ]; then
    echo "  [!] Absolute paths detected!"
    echo "$ABS_PATHS" | head -n 5
    FAILED=1
fi

# 2. Link Integrity & Path Style Check
while read -r file; do
    # Check for backslashes in markdown links (Windows-only style)
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
done < <(find . -name "*.md" -not -path "*/node_modules/*" -not -path "*/.git/*" -not -path "*/.claude/*" -not -path "*/.gemini/*")

# 3. Script Pairing Check
for script in scripts/*; do
    base=$(basename "$script" | sed 's/\.[^.]*$//')
    if [ "$base" == "install-vsp" ]; then continue; fi
    
    if [[ "$script" == *.sh ]]; then
        if [ ! -f "scripts/$base.ps1" ]; then
            echo "  [!] Cross-Platform: Missing .ps1 pair for '$base.sh'"
            # FAILED=1
        fi
    elif [[ "$script" == *.ps1 ]]; then
        if [ ! -f "scripts/$base.sh" ]; then
            echo "  [!] Cross-Platform: Missing .sh pair for '$base.ps1'"
            # FAILED=1
        fi
    fi
done

# 4. Redundancy Check
if [ -f "CLAUDE.md" ] && [ -f "GEMINI.md" ]; then
    if diff "CLAUDE.md" "GEMINI.md" > /dev/null; then
        echo "  [!] Redundancy: CLAUDE.md and GEMINI.md are identical."
    fi
fi

if [ $FAILED -ne 0 ]; then
    echo "Audit FAILED."
    exit 1
fi

echo "Audit PASSED."
exit 0
