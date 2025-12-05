# =====================================================
# SCRIPT PARA CREAR ACCESO DIRECTO EN EL ESCRITORIO
# =====================================================
#
# Este script crea un acceso directo al Sistema POS
# en el escritorio de Windows
#
# =====================================================

Write-Host "================================" -ForegroundColor Cyan
Write-Host " CREAR ACCESO DIRECTO POS" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Rutas
$projectPath = "C:\Sistema_VisualStudio\pos-client"
$desktopPath = [Environment]::GetFolderPath("Desktop")
$shortcutPath = Join-Path $desktopPath "Sistema POS.lnk"

Write-Host "[1/3] Verificando ruta del proyecto..." -ForegroundColor Yellow

if (-Not (Test-Path $projectPath)) {
    Write-Host "ERROR: No se encuentra la carpeta del proyecto en:" -ForegroundColor Red
    Write-Host "       $projectPath" -ForegroundColor Red
    Write-Host ""
    Write-Host "Por favor, asegurate de que el proyecto este en esa ubicacion." -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host "      OK - Proyecto encontrado" -ForegroundColor Green
Write-Host ""

Write-Host "[2/3] Creando acceso directo..." -ForegroundColor Yellow

try {
    # Crear el objeto WScript.Shell
    $WshShell = New-Object -ComObject WScript.Shell
    
    # Crear el acceso directo
    $Shortcut = $WshShell.CreateShortcut($shortcutPath)
    $Shortcut.TargetPath = "powershell.exe"
    $Shortcut.Arguments = "-WindowStyle Hidden -ExecutionPolicy Bypass -Command `"cd '$projectPath'; npm start`""
    $Shortcut.WorkingDirectory = $projectPath
    $Shortcut.Description = "Sistema POS - Supermercado"
    $Shortcut.IconLocation = "shell32.dll,138"
    $Shortcut.Save()
    
    Write-Host "      OK - Acceso directo creado" -ForegroundColor Green
    Write-Host ""
    
} catch {
    Write-Host "ERROR al crear el acceso directo:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    pause
    exit 1
}

Write-Host "[3/3] Verificando..." -ForegroundColor Yellow

if (Test-Path $shortcutPath) {
    Write-Host "      OK - Acceso directo verificado" -ForegroundColor Green
    Write-Host ""
    Write-Host "================================" -ForegroundColor Green
    Write-Host " COMPLETADO EXITOSAMENTE" -ForegroundColor Green
    Write-Host "================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "El acceso directo 'Sistema POS' se ha creado en tu escritorio." -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Para iniciar el sistema, simplemente hace doble clic en el acceso directo." -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host "ADVERTENCIA: No se puede verificar el acceso directo" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "Presiona cualquier tecla para salir..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

