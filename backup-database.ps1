# ==============================================================================
# SCRIPT SAO LƯU DATABASE POSTGRESQL (TRUE DIRECT CONNECTION) - CHUẨN BỊ MIGRATION
# ==============================================================================

$ErrorActionPreference = "Stop"

# 1. Xác định chính xác thư mục gốc dự án (Hỗ trợ đặt tại root hoặc trong scripts/)
# Tuyệt đối không fallback sang Get-Location; dừng ngay nếu không thấy .env.local
$candidateRoot1 = $PSScriptRoot
$candidateRoot2 = if ($PSScriptRoot) { (Get-Item $PSScriptRoot).Parent.FullName } else { $null }

$projectRoot = if ($candidateRoot1 -and (Test-Path (Join-Path $candidateRoot1 ".env.local"))) {
    $candidateRoot1
} elseif ($candidateRoot2 -and (Test-Path (Join-Path $candidateRoot2 ".env.local"))) {
    $candidateRoot2
} else {
    throw "Không thể xác định thư mục gốc dự án: không tìm thấy file .env.local tại '$candidateRoot1' hoặc '$candidateRoot2'. Vui lòng đảm bảo script được đặt tại thư mục gốc dự án hoặc trong thư mục scripts/."
}

# 2. Kiểm tra sự tồn tại của cả hai công cụ pg_dump.exe và pg_restore.exe
$pgDumpExe = "C:\Program Files\PostgreSQL\17\bin\pg_dump.exe"
$pgRestoreExe = "C:\Program Files\PostgreSQL\17\bin\pg_restore.exe"

if (-not (Test-Path $pgDumpExe)) {
    throw "Không tìm thấy công cụ pg_dump.exe tại: $pgDumpExe"
}
if (-not (Test-Path $pgRestoreExe)) {
    throw "Không tìm thấy công cụ pg_restore.exe tại: $pgRestoreExe"
}

# 3. Chuẩn bị thư mục backups và xử lý chống ghi đè file cũ
$backupDir = Join-Path -Path $projectRoot -ChildPath "backups"
if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
}

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupFile = Join-Path -Path $backupDir -ChildPath "db_backup_pre_rbac_$timestamp.dump"

# Cơ chế chống ghi đè: Nếu file trùng timestamp đã tồn tại, tự động tăng hậu tố
if (Test-Path $backupFile) {
    $counter = 1
    do {
        $backupFile = Join-Path -Path $backupDir -ChildPath "db_backup_pre_rbac_${timestamp}_$counter.dump"
        $counter++
    } while (Test-Path $backupFile)
}

# Định nghĩa đường dẫn tuyệt đối cho file log stderr tạm (chứa Process ID để tránh xung đột)
$tempStderrFile = Join-Path -Path $backupDir -ChildPath "dump_stderr_${timestamp}_$PID.log"

# 4. Lưu lại trạng thái ban đầu của các biến môi trường PG* để khôi phục sau khi chạy
$pgVars = @('PGHOST', 'PGPORT', 'PGDATABASE', 'PGUSER', 'PGPASSWORD', 'PGSSLMODE')
$originalEnv = @{}

foreach ($var in $pgVars) {
    if (Test-Path "Env:\$var") {
        $originalEnv[$var] = (Get-Item "Env:\$var").Value
    } else {
        $originalEnv[$var] = $null
    }
}

Write-Host ">>> Bắt đầu quy trình sao lưu database qua True Direct Connection..." -ForegroundColor Cyan

# 5. Đọc credential, xác thực nguồn và thực thi pg_dump trong try/finally
$dumpErrorOutput = @()

try {
    # 5.1. Đọc file .env.local
    $envLocalPath = Join-Path -Path $projectRoot -ChildPath ".env.local"
    if (-not (Test-Path $envLocalPath)) {
        throw "Không tìm thấy file .env.local tại thư mục dự án."
    }

    $rawLine = Get-Content $envLocalPath | Where-Object { $_ -match '^\s*DATABASE_URL\s*=' } | Select-Object -First 1
    if (-not $rawLine) {
        throw "Không tìm thấy biến DATABASE_URL trong .env.local"
    }

    # 5.2. Phân tích URI bằng System.Uri
    $rawUrl = ($rawLine -replace '^\s*DATABASE_URL\s*=\s*', '') -replace '^["'']', '' -replace '["'']$', ''
    $uri = [System.Uri]$rawUrl

    # 5.3. Xác thực nguồn dữ liệu chính xác trước khi trích xuất mật khẩu (Không in secret)
    $expectedHost = "aws-0-ap-southeast-1.pooler.supabase.com"
    $expectedExactUser = "postgres.clmxbvqgydtzvtgcgflb"
    $expectedDatabase = "postgres"
    $allowedSchemes = @("postgres", "postgresql")
    $expectedPort = 5432

    if ($uri.Scheme -notin $allowedSchemes) {
        throw "Xác thực thất bại: Scheme của chuỗi kết nối phải là 'postgres' hoặc 'postgresql'."
    }
    if ($uri.Port -ne $expectedPort) {
        throw "Xác thực thất bại: Port của chuỗi kết nối nguồn phải là $expectedPort."
    }

    $userInfo = $uri.UserInfo
    $colonIndex = $userInfo.IndexOf(':')
    if ($colonIndex -lt 0) {
        throw "Không trích xuất được mật khẩu từ UserInfo của chuỗi kết nối."
    }

    $actualUser = $userInfo.Substring(0, $colonIndex)
    $actualDb = $uri.AbsolutePath.TrimStart('/')

    if ($uri.Host -ne $expectedHost) {
        throw "Xác thực thất bại: Host nguồn trong .env.local không khớp với endpoint pooler đã xác minh."
    }
    if ($actualDb -ne $expectedDatabase) {
        throw "Xác thực thất bại: Database name không khớp với database 'postgres'."
    }
    if ($actualUser -ne $expectedExactUser) {
        throw "Xác thực thất bại: Username nguồn không khớp chính xác với '$expectedExactUser'."
    }

    # 5.4. Trích xuất mật khẩu an toàn và giải mã URL encoding
    $encodedPassword = $userInfo.Substring($colonIndex + 1)
    $decodedPassword = [System.Uri]::UnescapeDataString($encodedPassword)

    # 5.5. Cấu hình biến môi trường kết nối tới True Direct Connection
    $env:PGHOST     = "db.clmxbvqgydtzvtgcgflb.supabase.co"
    $env:PGPORT     = "5432"
    $env:PGDATABASE = "postgres"
    $env:PGUSER     = "postgres"
    $env:PGPASSWORD = $decodedPassword
    $env:PGSSLMODE  = "require"

    # 5.6. Gọi pg_dump với tham số -w (--no-password) để chống treo tiến trình
    # Chỉ định WorkingDirectory rõ ràng; ghi stderr vào file tuyệt đối tạm
    $dumpProcess = Start-Process -FilePath $pgDumpExe `
        -ArgumentList @("-w", "-F", "c", "-b", "-v", "-f", "`"$backupFile`"") `
        -WorkingDirectory $projectRoot `
        -NoNewWindow -Wait -PassThru -RedirectStandardError $tempStderrFile

    $dumpExitCode = $dumpProcess.ExitCode

    # Đọc stderr nếu có lỗi phát sinh
    if (Test-Path $tempStderrFile) {
        $dumpErrorOutput = Get-Content $tempStderrFile
    }

} finally {
    # 5.7. Dọn sạch file stderr tạm trong cả trường hợp thành công và thất bại
    if (Test-Path $tempStderrFile) {
        Remove-Item $tempStderrFile -Force -ErrorAction SilentlyContinue
    }

    # 5.8. Khôi phục chính xác trạng thái biến môi trường PG* ban đầu
    foreach ($var in $pgVars) {
        if ($null -ne $originalEnv[$var]) {
            Set-Item "Env:\$var" $originalEnv[$var]
        } else {
            Remove-Item "Env:\$var" -ErrorAction SilentlyContinue
        }
    }

    # 5.9. Thu hẹp thời gian tồn tại của credential: Hủy tham chiếu các biến trong PowerShell runtime
    Remove-Variable originalEnv, pgVars -ErrorAction SilentlyContinue
    Remove-Variable rawLine, rawUrl, uri, userInfo, colonIndex, encodedPassword, decodedPassword, actualUser, actualDb, allowedSchemes -ErrorAction SilentlyContinue
}

# 6. Kiểm tra kết quả thực thi của pg_dump
if ($dumpExitCode -ne 0 -or (-not (Test-Path $backupFile))) {
    Write-Host "pg_dump thất bại với mã lỗi $dumpExitCode." -ForegroundColor Red
    if ($dumpErrorOutput.Count -gt 0) {
        Write-Host "Thông tin lỗi hệ thống (đã làm sạch thông tin nhạy cảm):" -ForegroundColor Yellow
        $dumpErrorOutput | ForEach-Object {
            # Loại bỏ mọi nguy cơ lộ chuỗi kết nối hoặc thông tin nhạy cảm
            $sanitized = $_ -replace '(?i)(postgres(ql)?://[^\s]+)', '[URL_REDACTED]' -replace '(?i)(password\s*=\s*[^\s]+)', '[PASSWORD_REDACTED]'
            Write-Host "  $sanitized" -ForegroundColor Yellow
        }
    }
    throw "Quy trình sao lưu bị dừng do pg_dump gặp lỗi."
}

$fileSize = (Get-Item $backupFile).Length
if ($fileSize -eq 0) {
    throw "pg_dump hoàn tất nhưng file backup rỗng (0 bytes)."
}

Write-Host ">>> pg_dump hoàn tất thành công. File: $backupFile (Kích thước: $fileSize bytes)" -ForegroundColor Green

# 7. Kiểm tra cấu trúc bản dump qua pg_restore --list
Write-Host ">>> Đang kiểm tra cấu trúc bản dump bằng pg_restore --list..." -ForegroundColor Cyan

$restoreOutput = & $pgRestoreExe --list $backupFile 2>&1
$restoreExitCode = $LASTEXITCODE

if ($restoreExitCode -ne 0) {
    throw "pg_restore --list thất bại với exit code $restoreExitCode! File dump bị lỗi hoặc hỏng định dạng."
}

# Danh mục 4 bảng cốt lõi bắt buộc phải có mặt
$requiredTables = @("Flower", "Member", "User", "FlowerOwner")
$missingComponents = @()

foreach ($table in $requiredTables) {
    # Regex an toàn hỗ trợ cả định dạng unquoted (Flower) và quoted ("Flower")
    # Sử dụng backreference \1 để nếu mở ngoặc kép thì bắt buộc phải đóng ngoặc kép
    # Thêm -CaseSensitive để phân biệt chính xác chữ hoa/thường tên bảng
    $escaped = [regex]::Escape($table)
    $patternSchema = "TABLE public (`"?)$escaped\1(?=[\s;]|$)"
    $patternData   = "TABLE DATA public (`"?)$escaped\1(?=[\s;]|$)"

    $hasSchema = $restoreOutput | Select-String -Pattern $patternSchema -CaseSensitive -Quiet
    $hasData   = $restoreOutput | Select-String -Pattern $patternData -CaseSensitive -Quiet

    if (-not $hasSchema) {
        $missingComponents += "Thiếu định nghĩa bảng (TABLE): $table"
    }
    if (-not $hasData) {
        $missingComponents += "Thiếu mục dữ liệu (TABLE DATA): $table"
    }
}

if ($missingComponents.Count -gt 0) {
    Write-Warning "Cảnh báo: Bản dump không đầy đủ các thành phần bắt buộc:"
    $missingComponents | ForEach-Object { Write-Warning "- $_" }
    throw "Bản dump không hợp lệ vì thiếu định nghĩa hoặc dữ liệu của các bảng cốt lõi!"
}

Write-Host ">>> XÁC MINH CẤU TRÚC HOÀN TẤT: Bản dump hợp lệ, chứa đầy đủ định nghĩa cấu trúc và các mục dữ liệu của cả 4 bảng: Flower, Member, User, FlowerOwner." -ForegroundColor Green
Write-Host ">>> (Lưu ý: Đây là xác minh tính toàn vẹn cấu trúc danh mục lưu trữ, không thay thế việc kiểm thử khôi phục thực tế)." -ForegroundColor Yellow
