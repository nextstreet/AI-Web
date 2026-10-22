#!/usr/bin/env bash
# Directus 操作台服务器一键部署脚本（客户站点为 WordPress，本服务不生成前台）。
# 在服务器上克隆本仓库后，于 client-kit/directus/ 目录内运行：
#
#   cd /path/to/ai-seo-saas/client-kit/directus
#   ./setup.sh http://<服务器公网IP或域名>:8055
#
# 参数（可选）：Directus 的对外访问地址，用于 PUBLIC_URL。
# 脚本只负责启动容器、等待健康检查并应用数据模型快照；
# 令牌创建和种子数据按结尾提示在管理界面与本地机器完成。

set -euo pipefail
cd "$(dirname "$0")"

step() { printf '\n==> %s\n' "$1"; }
fail() { printf '✗ %s\n' "$1" >&2; exit 1; }

SNAPSHOT="snapshots/2026-10-22-operator-console.yaml"
PUBLIC_URL_ARG="${1:-}"

step "检查 Docker 环境"
command -v docker >/dev/null 2>&1 || fail "未安装 Docker，请先安装：curl -fsSL https://get.docker.com | sh"
docker compose version >/dev/null 2>&1 || fail "缺少 Docker Compose v2 插件"
command -v curl >/dev/null 2>&1 || fail "未安装 curl，请先安装（apt install curl 或 yum install curl）"
[ -f "$SNAPSHOT" ] || fail "找不到模型快照 $SNAPSHOT，请在 client-kit/directus/ 内运行"

step "准备 client-kit/directus/.env"
if [ ! -f .env ]; then
  cp .env.example .env
  command -v openssl >/dev/null 2>&1 || fail "未安装 openssl，无法生成 KEY/SECRET"
  sed -i "s|KEY=replace-with-32-byte-hex-key|KEY=$(openssl rand -hex 32)|" .env
  sed -i "s|SECRET=replace-with-32-byte-hex-secret|SECRET=$(openssl rand -hex 32)|" .env
  sed -i "s|ADMIN_PASSWORD=change-me|ADMIN_PASSWORD=$(openssl rand -base64 18 | tr -d '/+=')|" .env
  echo "已生成 KEY / SECRET / 管理员密码（写入 client-kit/directus/.env）。"
else
  echo "client-kit/directus/.env 已存在，保持不变。"
fi

if grep -q "KEY=replace-with\|SECRET=replace-with\|ADMIN_PASSWORD=change-me" .env; then
  sed -i "s|KEY=replace-with-32-byte-hex-key|KEY=$(openssl rand -hex 32)|; s|SECRET=replace-with-32-byte-hex-secret|SECRET=$(openssl rand -hex 32)|; s|ADMIN_PASSWORD=change-me|ADMIN_PASSWORD=$(openssl rand -base64 18 | tr -d '/+=')|" .env
  echo "检测到占位密钥，已自动替换。"
fi

if [ -n "$PUBLIC_URL_ARG" ]; then
  sed -i "s|^PUBLIC_URL=.*|PUBLIC_URL=$PUBLIC_URL_ARG|" .env
  echo "PUBLIC_URL 已设为 $PUBLIC_URL_ARG"
fi

step "启动容器（首次会拉取镜像）"
docker compose up -d

step "等待 Directus 健康检查"
for i in $(seq 1 60); do
  if curl -fsS http://localhost:8055/server/health >/dev/null 2>&1; then
    echo "Directus 已就绪。"
    break
  fi
  [ "$i" -eq 60 ] && fail "等待超时：查看日志 docker compose logs directus"
  sleep 2
done

step "应用操作台数据模型（4 个集合，幂等可重跑）"
docker compose exec -T directus directus schema apply "/directus/$SNAPSHOT"

step "部署完成"
ADMIN_EMAIL=$(grep '^ADMIN_EMAIL=' .env | cut -d= -f2-)
cat <<EOF

后续步骤（一次性配置）：
  1. 浏览器打开 \${PUBLIC_URL}（或 http://<服务器IP>:8055），
     用 $ADMIN_EMAIL 和 client-kit/directus/.env 里的 ADMIN_PASSWORD 登录。
     如还没开放 8055 端口，请放行防火墙/安全组。
  2. 创建自动化身份：Settings -> Roles/Policies 新建 "Automation"，
     只给 tenants、candidates、deliverables、runs 的 Item 读写权限，
     再建一个用户绑定该角色并生成 Static Token，供 n8n 调用。
     你自己的登录账号保持管理员，不要把这个令牌写进浏览器代码。
  3. 在 n8n 中创建客户 WordPress 凭据（Application Password），
     凭据名称与 Directus tenants.credential_ref 保持一致。
  4. （可选）灌入示例数据，在本地电脑运行：
        \$env:DIRECTUS_URL = "http://<服务器IP>:8055"
        \$env:DIRECTUS_ADMIN_TOKEN = "<管理员令牌>"
        node client-kit/directus/seed/seed.mjs --dry-run
        node client-kit/directus/seed/seed.mjs
     种子会创建 1 个演示租户、2 条候选、2 条交付物、1 条运行记录。
  5. 工作流主线：candidate -> deliverable -> WordPress 草稿/发布，
     运行结果写回 runs。客户站点是 WordPress，本平台不生成前台页面。
EOF
