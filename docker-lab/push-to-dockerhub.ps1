# ─────────────────────────────────────────────────────────────
# Q3 (part 1) — Push the v2 image to Docker Hub
# Run from Windows PowerShell on the host machine.
# ─────────────────────────────────────────────────────────────

$USER = "jechuimmanuel"
$REPO = "portfolio"

Write-Host "`n[1/4] Images available locally:" -ForegroundColor Cyan
docker images "$USER/$REPO"

Write-Host "`n[2/4] Logging in to Docker Hub as $USER ..." -ForegroundColor Cyan
Write-Host "      (enter your Docker Hub password or access token when prompted)"
docker login -u $USER
if ($LASTEXITCODE -ne 0) { Write-Host "Login failed - aborting." -ForegroundColor Red; exit 1 }

Write-Host "`n[3/4] Pushing tags ..." -ForegroundColor Cyan
docker push "$USER/$REPO`:v2"
docker push "$USER/$REPO`:latest"

Write-Host "`n[4/4] Done. Verify at:" -ForegroundColor Green
Write-Host "      https://hub.docker.com/r/$USER/$REPO/tags"
Write-Host "`nTake the 'dockerhub.png' screenshot of that page for the report."
