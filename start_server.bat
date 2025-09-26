@echo off
echo Iniciando servidor local do CryptoWallet Manager...
echo.
echo Servidor rodando em: http://localhost:8000
echo Pressione Ctrl+C para parar o servidor
echo.
python -m http.server 8000
pause