$ErrorActionPreference = 'SilentlyContinue'

Write-Output "=== BACKEND process.env References ==="
Get-ChildItem -Path 'Backend' -Recurse -Include *.js,*.cjs,*.mjs -File |
  Where-Object { $_.FullName -notmatch 'node_modules' } |
  Select-String -Pattern 'process\.env\.[A-Z0-9_]+' |
  ForEach-Object {
    $rel = $_.Path.Replace($PWD.Path, '')
    "{0}:{1}: {2}" -f $rel, $_.LineNumber, $_.Line.Trim()
  }

Write-Output ""
Write-Output "=== FRONTEND import.meta.env References ==="
Get-ChildItem -Path 'Project\src' -Recurse -Include *.js,*.jsx -File |
  Where-Object { $_.FullName -notmatch 'node_modules' } |
  Select-String -Pattern 'import\.meta\.env\.[A-Z0-9_]+' |
  ForEach-Object {
    $rel = $_.Path.Replace($PWD.Path, '')
    "{0}:{1}: {2}" -f $rel, $_.LineNumber, $_.Line.Trim()
  }

Write-Output ""
Write-Output "=== dotenv.config() References ==="
Get-ChildItem -Path 'Backend' -Recurse -Include *.js,*.cjs,*.mjs -File |
  Where-Object { $_.FullName -notmatch 'node_modules' } |
  Select-String -Pattern 'dotenv|config\(' |
  ForEach-Object {
    $rel = $_.Path.Replace($PWD.Path, '')
    "{0}:{1}: {2}" -f $rel, $_.LineNumber, $_.Line.Trim()
  }

Write-Output ""
Write-Output "=== mongoose.connect References ==="
Get-ChildItem -Path 'Backend' -Recurse -Include *.js,*.cjs,*.mjs -File |
  Where-Object { $_.FullName -notmatch 'node_modules' } |
  Select-String -Pattern 'mongoose\.connect|createConnection' |
  ForEach-Object {
    $rel = $_.Path.Replace($PWD.Path, '')
    "{0}:{1}: {2}" -f $rel, $_.LineNumber, $_.Line.Trim()
  }

Write-Output ""
Write-Output "=== Axios / API URL References ==="
Get-ChildItem -Path 'Project\src' -Recurse -Include *.js,*.jsx -File |
  Where-Object { $_.FullName -notmatch 'node_modules' } |
  Select-String -Pattern 'axios|baseURL|API_URL|baseUrl' |
  ForEach-Object {
    $rel = $_.Path.Replace($PWD.Path, '')
    "{0}:{1}: {2}" -f $rel, $_.LineNumber, $_.Line.Trim()
  }

Write-Output ""
Write-Output "=== JWT References ==="
Get-ChildItem -Path 'Backend' -Recurse -Include *.js,*.cjs,*.mjs -File |
  Where-Object { $_.FullName -notmatch 'node_modules' } |
  Select-String -Pattern 'JWT|jwt\.sign|jwt\.verify' |
  ForEach-Object {
    $rel = $_.Path.Replace($PWD.Path, '')
    "{0}:{1}: {2}" -f $rel, $_.LineNumber, $_.Line.Trim()
  }

Write-Output ""
