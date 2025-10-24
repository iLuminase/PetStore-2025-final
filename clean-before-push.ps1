# PowerShell script to clean all build artifacts before pushing to GitHub
# Run this from project root: .\clean-before-push.ps1

Write-Host "🧹 Cleaning PetStore project before GitHub push..." -ForegroundColor Cyan

# Clean Backend (Maven)
Write-Host ""
Write-Host "📦 Cleaning Backend Maven projects..." -ForegroundColor Yellow

Set-Location "be\auth-api"
mvn clean
Set-Location "..\..\"

Set-Location "be\product-api"
mvn clean
Set-Location "..\..\"

Set-Location "be\gateway-api"
mvn clean
Set-Location "..\..\"

Set-Location "be\cart-api"
mvn clean
Set-Location "..\..\"

# Clean Frontend (Angular)
Write-Host ""
Write-Host "🅰️  Cleaning Frontend Angular projects..." -ForegroundColor Yellow

Set-Location "fe"
if (Test-Path "node_modules") {
    Remove-Item -Path "node_modules" -Recurse -Force
    Write-Host "  ✓ Removed node_modules" -ForegroundColor Green
}
if (Test-Path ".angular") {
    Remove-Item -Path ".angular" -Recurse -Force
    Write-Host "  ✓ Removed .angular cache" -ForegroundColor Green
}
if (Test-Path "dist") {
    Remove-Item -Path "dist" -Recurse -Force
    Write-Host "  ✓ Removed dist" -ForegroundColor Green
}
# Clean project-specific build outputs
Get-ChildItem -Path "projects" -Directory | ForEach-Object {
    $distPath = Join-Path $_.FullName "dist"
    $angularPath = Join-Path $_.FullName ".angular"
    if (Test-Path $distPath) {
        Remove-Item -Path $distPath -Recurse -Force
        Write-Host "  ✓ Removed $($_.Name)/dist" -ForegroundColor Green
    }
    if (Test-Path $angularPath) {
        Remove-Item -Path $angularPath -Recurse -Force
        Write-Host "  ✓ Removed $($_.Name)/.angular" -ForegroundColor Green
    }
}
Set-Location ".."

# Clean logs
Write-Host ""
Write-Host "📋 Cleaning logs..." -ForegroundColor Yellow
if (Test-Path "logs") {
    Get-ChildItem -Path "logs" -Filter "*.log" | Remove-Item -Force
    Write-Host "  ✓ Cleaned log files" -ForegroundColor Green
}

Write-Host ""
Write-Host "✅ Clean completed!" -ForegroundColor Green

Write-Host ""
Write-Host "📊 Checking repository size..." -ForegroundColor Cyan
$size = (Get-ChildItem -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
Write-Host "Total size: $([math]::Round($size, 2)) MB" -ForegroundColor White

Write-Host ""
Write-Host "🔍 Files that will be committed:" -ForegroundColor Cyan
git status

Write-Host ""
Write-Host "✨ Ready to commit and push to GitHub!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. git add ." -ForegroundColor White
Write-Host "  2. git commit -m 'Your commit message'" -ForegroundColor White
Write-Host "  3. git push" -ForegroundColor White
