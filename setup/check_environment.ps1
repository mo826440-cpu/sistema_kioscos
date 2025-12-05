# =====================================================
# Script de Verificacion de Entorno - Windows PowerShell
# Sistema POS para Supermercado
# =====================================================
#
# Que hace este script?
# Verifica que tu computadora tenga todas las herramientas
# necesarias para desarrollar el sistema POS.
#
# Como ejecutarlo:
# 1. Abri PowerShell
# 2. Navega a la carpeta del proyecto: cd C:\Sistema_VisualStudio
# 3. Ejecuta: .\setup\check_environment.ps1
#
# =====================================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  VERIFICACION DE ENTORNO - POS SYSTEM  " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$allGood = $true

# =====================================================
# 1. Node.js (IMPRESCINDIBLE)
# =====================================================
Write-Host "[*] Verificando Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>$null
    if ($nodeVersion) {
        Write-Host "   [OK] Node.js instalado: $nodeVersion" -ForegroundColor Green
    } else {
        throw "No encontrado"
    }
} catch {
    Write-Host "   [X] Node.js NO instalado" -ForegroundColor Red
    Write-Host "   >> Instalalo desde: https://nodejs.org/" -ForegroundColor White
    Write-Host "   >> Recomendado: Version LTS (Long Term Support)" -ForegroundColor White
    Write-Host ""
    $allGood = $false
}

# =====================================================
# 2. npm (IMPRESCINDIBLE - viene con Node.js)
# =====================================================
Write-Host "[*] Verificando npm (Node Package Manager)..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version 2>$null
    if ($npmVersion) {
        Write-Host "   [OK] npm instalado: v$npmVersion" -ForegroundColor Green
    } else {
        throw "No encontrado"
    }
} catch {
    Write-Host "   [X] npm NO instalado" -ForegroundColor Red
    Write-Host "   >> Normalmente viene con Node.js, reinstala Node.js" -ForegroundColor White
    Write-Host ""
    $allGood = $false
}

# =====================================================
# 3. Git (RECOMENDADO - para control de versiones)
# =====================================================
Write-Host "[*] Verificando Git..." -ForegroundColor Yellow
try {
    $gitVersion = git --version 2>$null
    if ($gitVersion) {
        Write-Host "   [OK] Git instalado: $gitVersion" -ForegroundColor Green
    } else {
        throw "No encontrado"
    }
} catch {
    Write-Host "   [!] Git NO instalado (recomendado)" -ForegroundColor Yellow
    Write-Host "   >> Instalalo desde: https://git-scm.com/download/win" -ForegroundColor White
    Write-Host "   >> Git te ayuda a guardar versiones del codigo" -ForegroundColor White
    Write-Host ""
}

# =====================================================
# 4. Editor de Codigo (RECOMENDADO)
# =====================================================
Write-Host "[*] Verificando editor de codigo..." -ForegroundColor Yellow
$vsCodePath = "C:\Program Files\Microsoft VS Code\Code.exe"
$cursorPath = "$env:LOCALAPPDATA\Programs\Cursor\Cursor.exe"

if (Test-Path $cursorPath) {
    Write-Host "   [OK] Cursor instalado (excelente)" -ForegroundColor Green
} elseif (Test-Path $vsCodePath) {
    Write-Host "   [OK] VS Code instalado (excelente)" -ForegroundColor Green
} else {
    Write-Host "   [!] No se detecto VS Code ni Cursor" -ForegroundColor Yellow
    Write-Host "   >> Cursor: https://cursor.sh/" -ForegroundColor White
    Write-Host "   >> VS Code: https://code.visualstudio.com/" -ForegroundColor White
    Write-Host ""
}

# =====================================================
# 5. Python (OPCIONAL - para algunas herramientas)
# =====================================================
Write-Host "[*] Verificando Python (opcional)..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>$null
    if ($pythonVersion) {
        Write-Host "   [OK] Python instalado: $pythonVersion" -ForegroundColor Green
    } else {
        throw "No encontrado"
    }
} catch {
    Write-Host "   [i] Python no instalado (opcional)" -ForegroundColor Gray
}

# =====================================================
# RESUMEN FINAL
# =====================================================
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
if ($allGood) {
    Write-Host "  [OK] TODO LISTO PARA EMPEZAR!  " -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host ">> Podes comenzar con la Fase 1: Elegir stack tecnologico" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "  [!] FALTAN HERRAMIENTAS IMPRESCINDIBLES  " -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host ">> Instala las herramientas marcadas con [X] y volve a ejecutar este script." -ForegroundColor Yellow
    Write-Host ""
}

# =====================================================
# INFORMACION ADICIONAL
# =====================================================
Write-Host "[i] Informacion del sistema:" -ForegroundColor Cyan
Write-Host "   - Windows version: $([System.Environment]::OSVersion.Version)" -ForegroundColor Gray
Write-Host "   - PowerShell version: $($PSVersionTable.PSVersion)" -ForegroundColor Gray
Write-Host "   - Carpeta actual: $(Get-Location)" -ForegroundColor Gray
Write-Host ""
Write-Host "Para mas ayuda, lee: docs/prompt_inicial.md" -ForegroundColor Cyan
Write-Host ""
