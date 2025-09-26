# Script para inicializar o servidor de desenvolvimento do CryptoWallet Manager
# Uso: .\Start-Dev-Server.ps1

Write-Host "🚀 Iniciando CryptoWallet Manager..." -ForegroundColor Green
Write-Host ""

# Verifica se o Python está instalado
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Python detectado: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python não encontrado. Instale o Python primeiro." -ForegroundColor Red
    exit 1
}

# Verifica se os arquivos necessários existem
$requiredFiles = @("index.html", "script.js", "style.css")
foreach ($file in $requiredFiles) {
    if (!(Test-Path $file)) {
        Write-Host "❌ Arquivo $file não encontrado!" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Todos os arquivos encontrados" -ForegroundColor Green

# Inicia o servidor
$port = 8000
Write-Host ""
Write-Host "🌐 Servidor iniciando na porta $port..." -ForegroundColor Yellow
Write-Host "📂 URL: http://localhost:$port" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 O navegador será aberto automaticamente em 3 segundos..." -ForegroundColor Yellow
Write-Host "🛑 Pressione Ctrl+C para parar o servidor" -ForegroundColor Red
Write-Host ""

# Inicia o servidor em background
$serverProcess = Start-Process python -ArgumentList "-m", "http.server", "$port" -PassThru -WindowStyle Hidden

# Aguarda um momento e abre o navegador
Start-Sleep 3
Start-Process "http://localhost:$port"

Write-Host "✅ Servidor rodando! ID do processo: $($serverProcess.Id)" -ForegroundColor Green
Write-Host ""
Write-Host "Para parar o servidor, pressione Ctrl+C ou execute:" -ForegroundColor Yellow
Write-Host "Stop-Process -Id $($serverProcess.Id)" -ForegroundColor Cyan

# Mantém o script rodando
try {
    while ($serverProcess -and !$serverProcess.HasExited) {
        Start-Sleep 1
    }
} finally {
    Write-Host ""
    Write-Host "🛑 Servidor parado." -ForegroundColor Red
}