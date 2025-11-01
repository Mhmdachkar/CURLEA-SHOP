# PowerShell script to create .env file for Curlea Main App

Write-Host "Creating .env file..." -ForegroundColor Cyan

$envContent = @"
VITE_SUPABASE_URL=https://vfhxwzcbjdlfmizakvqc.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmaHh3emNiamRsZm1pemFrdnFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjg0MDQ0MTcsImV4cCI6MjA0Mzk4MDQxN30.RER6Cqhbelgië7qZGxJVYNnXZ5iI4nbVZoQXdWEHT6fZE
VITE_ANALYTICS_ENDPOINT=https://vfhxwzcbjdlfmizakvqc.supabase.co/functions/v1/track
"@

# Get the directory where this script is located
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Create .env file
$envPath = Join-Path $scriptDir ".env"
$envContent | Out-File -FilePath $envPath -Encoding UTF8 -NoNewline

Write-Host "✅ .env file created successfully at: $envPath" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Restart your dev server" -ForegroundColor Yellow
Write-Host "   Stop: Ctrl+C" -ForegroundColor Gray
Write-Host "   Start: npm run dev" -ForegroundColor Yellow
Write-Host "2. Test Stripe checkout!" -ForegroundColor Yellow
Write-Host ""
Write-Host "Your Stripe checkout is ready! 🎉" -ForegroundColor Green
