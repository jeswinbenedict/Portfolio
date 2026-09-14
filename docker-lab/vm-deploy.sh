#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# Q3 (part 2) — Deploy the v2 image on the Linux VM
# Copy this file into the VM (or just paste the commands) and run:
#     bash vm-deploy.sh
# ─────────────────────────────────────────────────────────────
set -e

IMAGE="jechuimmanuel/portfolio:v2"
NAME="portfolio"
PORT=3000

echo "[1/6] Installing Docker (skipped if already present)..."
if ! command -v docker >/dev/null 2>&1; then
  sudo apt-get update
  sudo apt-get install -y ca-certificates curl
  curl -fsSL https://get.docker.com | sudo sh
  sudo usermod -aG docker "$USER"
  echo ">> Docker installed. Log out and back in, then re-run this script."
  exit 0
fi
docker --version

echo "[2/6] Pulling $IMAGE from Docker Hub..."
docker pull "$IMAGE"

echo "[3/6] Removing any previous container named $NAME..."
docker rm -f "$NAME" 2>/dev/null || true

echo "[4/6] Starting the container..."
docker run -d --name "$NAME" --restart unless-stopped -p "$PORT:3000" "$IMAGE"

echo "[5/6] Opening the firewall (if ufw is active)..."
sudo ufw allow "$PORT"/tcp 2>/dev/null || echo "  (ufw not in use - skipped)"

echo "[6/6] Verifying..."
sleep 5
docker ps
echo
echo -n "HTTP status: "
curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:$PORT"
echo -n "Version badge found: "
curl -s "http://localhost:$PORT" | grep -o "v2 · Dockerized" | head -1

VM_IP=$(hostname -I | awk '{print $1}')
echo
echo "================================================="
echo " Open this in the HOST browser:"
echo "   http://$VM_IP:$PORT"
echo "================================================="
