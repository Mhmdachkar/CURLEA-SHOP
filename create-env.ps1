# PowerShell script to create .env file for Curlea Main App
# SECURITY NOTE: This file should NOT contain real credentials
# Use .env.example as a template and fill in your actual values locally

Write-Host "⚠️  SECURITY WARNING: Do NOT commit your .env file!" -ForegroundColor Red
Write-Host "Creating .env file from template..." -ForegroundColor Cyan

$envContent = @"
# Supabase Configuration
# Get these from: Supabase Dashboard → Settings → API → API Keys tab
# Use NEW API Keys (recommended): sb_publishable_... and sb_secret_...
# OR Legacy JWT Keys: eyJhbGc... (if still using legacy)
VITE_SUPABASE_URL=your_supabase_project_url_here
VITE_SUPABASE_ANON_KEY=sb_publishable_your_key_here
VITE_ANALYTICS_ENDPOINT=your_supabase_project_url_here/functions/v1/track

# Note: Service Role Key should NEVER be exposed to client-side code
# It should only be used in server-side functions (Netlify/Supabase Edge Functions)
# Service Role Key: sb_secret_your_key_here
"@

# Get the directory where this script is located
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Create .env file
$envPath = Join-Path $scriptDir ".env"
$envContent | Out-File -FilePath $envPath -Encoding UTF8 -NoNewline

Write-Host "✅ .env template created at: $envPath" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  IMPORTANT: Fill in your actual credentials!" -ForegroundColor Yellow
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Open .env file and replace placeholder values" -ForegroundColor Yellow
Write-Host "2. Get Supabase credentials from: https://app.supabase.com" -ForegroundColor Gray
Write-Host "   → Your Project → Settings → API" -ForegroundColor Gray
Write-Host "3. Ensure .env is in .gitignore (DO NOT commit)" -ForegroundColor Red
Write-Host "4. Restart your dev server" -ForegroundColor Yellow
Write-Host "   Stop: Ctrl+C" -ForegroundColor Gray
Write-Host "   Start: npm run dev" -ForegroundColor Yellow
Write-Host ""
Write-Host "🔒 Security Reminder: NEVER commit real credentials!" -ForegroundColor Red
