# PowerShell script to create .env file for Curlea Analytics Dashboard

$envContent = @"
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
"@

# Get the directory where this script is located
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Create .env file
$envPath = Join-Path $scriptDir ".env"
$envContent | Out-File -FilePath $envPath -Encoding UTF8 -NoNewline

Write-Host "✅ .env file created successfully at: $envPath" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Run: npm run dev" -ForegroundColor Yellow
Write-Host "2. Open: http://localhost:3000" -ForegroundColor Yellow
Write-Host ""
Write-Host "Your analytics dashboard is ready! 🎉" -ForegroundColor Green
