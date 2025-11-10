# Docker Hub Push Guide

## Step 1: Create Docker Hub Personal Access Token (PAT)

1. Go to: https://app.docker.com/settings/personal-access-tokens
2. Click **"Generate New Token"**
3. Give it a name: `Interactive-Dashboard`
4. Set permissions: **Read, Write, Delete**
5. Click **Generate**
6. **COPY THE TOKEN** (you won't see it again!)

## Step 2: Login to Docker Hub

```powershell
# Login with username and PAT (paste the token when asked for password)
docker login -u minhas1278
# When prompted for password, paste your PAT token
```

Or use this one-liner (replace YOUR_PAT with your actual token):
```powershell
echo YOUR_PAT | docker login -u minhas1278 --password-stdin
```

## Step 3: Tag Your Image (Already Done! ✅)

```powershell
docker tag interactivedashboard-web:latest minhas1278/interactive-dashboard:latest
```

## Step 4: Push to Docker Hub

```powershell
docker push minhas1278/interactive-dashboard:latest
```

## Step 5: Verify on Docker Hub

Visit: https://hub.docker.com/r/minhas1278/interactive-dashboard

---

## Quick Commands Summary

```powershell
# 1. Login
docker login -u minhas1278

# 2. Tag (already done)
docker tag interactivedashboard-web:latest minhas1278/interactive-dashboard:latest

# 3. Push
docker push minhas1278/interactive-dashboard:latest

# 4. Verify locally
docker images | findstr "minhas1278"
```

## Alternative: Use Docker Hub Repository

If the above doesn't work, you can also:

1. Create a public repository on Docker Hub manually:
   - Go to https://hub.docker.com
   - Click **"Create Repository"**
   - Name: `interactive-dashboard`
   - Visibility: **Public**
   - Click **"Create"**

2. Then follow the push commands above

---

## For AWS EC2 Deployment

Once pushed, you can pull the image on AWS EC2 with:

```bash
docker pull minhas1278/interactive-dashboard:latest
```

And update your docker-compose-part1.yml to use this image:

```yaml
services:
  web:
    image: minhas1278/interactive-dashboard:latest  # Use your Docker Hub image
    container_name: interactive_dashboard_web
    # ... rest of the config
```
