# VSP Scripts

## Shell Automation

All scripts are written in both **PowerShell** (`.ps1`) and **Bash** (`.sh`) to ensure cross-platform compatibility.
According to the project rules, any modification, creation, or deletion of a script must be done to both its `.ps1` and `.sh` counterparts simultaneously.

## Usage

### Windows (PowerShell)
```powershell
# Run the development sync pipeline
.\scripts\dev-sync.ps1 "feat: add feature"

# Run project audit
.\scripts\audit.ps1
```

### macOS / Linux (Bash)
```bash
# Run the development sync pipeline
bash scripts/dev-sync.sh "feat: add feature"

# Run project audit
bash scripts/audit.sh
```

## Available Scripts

| Script Base | Purpose | Priority |
|-------------|---------|:--------:|
| `dev-sync` | Full dev sync pipeline (changelog -> audit -> commit) | P0 |
| `gen-pr-body` | Generates a structured PR body incorporating changelog & memory | P0 |
| `audit` | Documentation and path integrity audit | P0 |
| `sync-md` | Markdown synchronization and linting | P1 |
| `setup` | Project environment bootstrap | P1 |

## Troubleshooting

### Permission denied on .sh files
```bash
chmod +x scripts/*.sh
```

### Script Execution Policies (Windows)
If PowerShell blocks script execution, you may need to bypass the execution policy for the current session:
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```
