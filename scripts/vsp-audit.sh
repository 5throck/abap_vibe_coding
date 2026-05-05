#!/bin/bash
# scripts/vsp-audit.sh
# Cross-platform documentation audit (Unix: macOS/Linux)

FAILED=0
echo "--- Documentation Audit (Unix) ---"

# 1. Absolute Path Check
# Searches for Windows drive letters (C:\), /Users/, or /home/
ABS_PATHS=$(grep -rEi "[A-Z]:\\\\|/Users/|/home/" . --include="*.md" | grep -vE "node_modules|\.git|setup-guide.md")
if [ -n "$ABS_PATHS" ]; then
    echo "  [!] Absolute paths detected!"
    echo "$ABS_PATHS" | head -n 5
    FAILED=1
fi

# 2. Link Integrity Check
# Finds local links [text](path) and checks if file exists
find . -name "*.md" -not -path "*/node_modules/*" -not -path "*/.git/*" | while read -r file; do
    # Extract links in [text](link) format. Using sed for portability across BSD/GNU.
    links=$(grep -o '\[.*\]([^#)]*)' "$file" | sed -E 's/.*\]\(([^# )]+)\).*/\1/' | grep -vE "^http|^mailto:|^#|YYYY-MM-DD")
    
    for link in $links; do
        # URL Decode space
        decoded_link=$(echo "$link" | sed 's/%20/ /g')
        dir=$(dirname "$file")
        target="$dir/$decoded_link"
        
        if [ ! -e "$target" ]; then
            echo "  [!] Broken link in $file -> $link"
            FAILED=1
        fi
    done
done

# 3. Redundancy Check
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
