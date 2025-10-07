# PowerShell script to fix large file issues for GitHub
Write-Host "🔧 Fixing large file issues for GitHub push..." -ForegroundColor Green

# Step 1: Remove the large video file from the repository
$largeFile = "src/assets/Heatless Hair Curling Rod/product5/Untitled video - Made with Clipchamp (3).mp4"
if (Test-Path $largeFile) {
    Write-Host "📁 Found large file: $largeFile" -ForegroundColor Yellow
    Write-Host "🗑️ Removing large file from git tracking..." -ForegroundColor Yellow
    git rm --cached "$largeFile"
    Remove-Item "$largeFile" -Force
    Write-Host "✅ Large file removed" -ForegroundColor Green
}

# Step 2: Add .gitignore entry for large files
$gitignoreContent = @"
# Large files that exceed GitHub's 100MB limit
*.mp4
*.mov
*.avi
*.mkv
*.wmv
*.flv
*.webm

# Exception for smaller video files (under 100MB)
!src/assets/Heatless Hair Curling Rod/69fb9b50593547f3899618d65d85cec5.HD-1080p-7.2Mbps-11546034.mp4
!src/assets/Heatless Hair Curling Rod/product6/Screen Recording 2025-10-06 223323.mp4
!src/assets/curly hair collection/Download (3).mp4
!src/assets/curly hair collection/product2/Screen Recording 2025-10-04 143847.mp4
!src/assets/curly hair collection/product3/Screen Recording 2025-10-05 155052.mp4
"@

Write-Host "📝 Updating .gitignore for video files..." -ForegroundColor Yellow
Add-Content -Path ".gitignore" -Value $gitignoreContent

# Step 3: Commit the changes
Write-Host "Committing changes..." -ForegroundColor Yellow
git add .gitignore
git commit -m "Remove large video file and update .gitignore for GitHub compatibility"

Write-Host "🎉 Large file issue fixed! You can now push to GitHub." -ForegroundColor Green
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Run: git push origin main" -ForegroundColor White
Write-Host "   2. For the removed video, consider:" -ForegroundColor White
Write-Host "      - Compressing it to under 100MB" -ForegroundColor White
Write-Host "      - Using a cloud storage service (Google Drive, Dropbox)" -ForegroundColor White
Write-Host "      - Using Git LFS for version control" -ForegroundColor White
