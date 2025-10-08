# PowerShell script to create .env file for Curlea Analytics Dashboard

$envContent = @"
VITE_SUPABASE_URL=https://vfhxwzcbjdlfmizakvqc.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmaHh3emNiamRsZm1pemFrdnFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjg0MDQ0MTcsImV4cCI6MjA0Mzk4MDQxN30.RER6Cqhbelgië7qZGxJVYNnXZ5iI4nbVZoQXdWEHT6fZE
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

