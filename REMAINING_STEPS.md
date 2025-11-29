# Assignment 2 - Current Status & Remaining Steps

## ✅ COMPLETED (70% Done!)

### Part I - Containerized Deployment ✅
- ✅ Application: Interactive Dashboard with D3.js
- ✅ Backend: Node.js + Express + MySQL
- ✅ Dockerfile: Created and optimized
- ✅ Docker image built and pushed to Docker Hub: `minhasfarhat/interactive-dashboard:latest`
- ✅ docker-compose-part1.yml: With persistent DB volume
- ✅ Deployed on AWS EC2 (t2.micro, Ubuntu 24.04)
- ✅ Containers running: Web (port 3000), MySQL (port 3306)
- ✅ Database connection: Working ("DB ready")
- ✅ **Application URL: http://34.229.173.85:3000** ✅

### Part II - Jenkins Setup (50% Done)
- ✅ GitHub repository: https://github.com/minhas1278/Interactive-Dashboard
- ✅ Instructor added as collaborator: qasimalik@gmail.com
- ✅ docker-compose.yml: Part II with volume mount
- ✅ Jenkinsfile: Complete pipeline script
- ✅ Java 17 installed on EC2
- ✅ Jenkins 2.528.1 installed on EC2
- ⚠️ Jenkins service: **Needs to be started**

---

## 🚀 REMAINING STEPS (30%)

### Step 1: Connect to EC2 and Start Jenkins (10 minutes)

**After rebooting your EC2 instance, reconnect and run:**

```bash
# Start Jenkins
sudo systemctl start jenkins
sudo systemctl enable jenkins

# Add Jenkins to Docker group
sudo usermod -aG docker jenkins

# Restart Jenkins
sudo systemctl restart jenkins

# Verify Jenkins is running
sudo systemctl status jenkins
# Should show: "active (running)" in green

# Get Jenkins initial password
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
# Copy this password - you'll need it!
```

---

### Step 2: Access Jenkins UI (5 minutes)

**Make sure port 8080 is open in Security Group!**

1. Go to AWS Console → EC2 → Security Groups
2. Find your security group (launch-wizard-1)
3. Edit inbound rules → Add rule:
   - **Type:** Custom TCP
   - **Port:** 8080
   - **Source:** 0.0.0.0/0
   - Save

**Access Jenkins:**
- URL: **http://34.229.173.85:8080**
- Paste the initial admin password
- Click "Install suggested plugins"
- Create admin user (username: admin, password: admin123 or your choice)
- Jenkins URL: Keep default (http://34.229.173.85:8080)
- Click "Start using Jenkins"

---

### Step 3: Install Docker Pipeline Plugin (3 minutes)

1. Go to **Manage Jenkins → Plugins → Available plugins**
2. Search: **Docker Pipeline**
3. Check the box
4. Click **Install** (no restart needed)
5. Wait for it to complete

---

### Step 4: Verify Jenkins Can Use Docker (2 minutes)

SSH to EC2 and run:

```bash
# Test if Jenkins can use Docker
sudo -u jenkins docker ps
# Should show your Part I containers!

# If you see permission denied, run:
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
# Wait 30 seconds, then test again
```

---

### Step 5: Create Pipeline Job (5 minutes)

1. Click **"New Item"**
2. Name: `Interactive-Dashboard-Pipeline`
3. Type: **Pipeline**
4. Click **OK**

**Configure:**

- **General:**
  - Description: `Automated deployment for Interactive Dashboard`
  
- **Build Triggers:**
  - ☑ **GitHub hook trigger for GITScm polling**
  
- **Pipeline:**
  - Definition: **Pipeline script from SCM**
  - SCM: **Git**
  - Repository URL: `https://github.com/minhas1278/Interactive-Dashboard.git`
  - Credentials: *(leave empty - public repo)*
  - Branch: `*/main`
  - Script Path: `Jenkinsfile`

- Click **Save**

---

### Step 6: Setup GitHub Webhook (5 minutes)

**Make sure port 8080 is accessible from internet (0.0.0.0/0)!**

1. Go to: https://github.com/minhas1278/Interactive-Dashboard/settings/hooks
2. Click **"Add webhook"**
3. **Payload URL:** `http://34.229.173.85:8080/github-webhook/`
   - ⚠️ **Must end with /**
4. **Content type:** `application/json`
5. **Which events:** Just the push event
6. **Active:** ☑
7. Click **"Add webhook"**
8. You should see a green ✓ after a few seconds

---

### Step 7: Test Pipeline - Manual Build (5 minutes)

**IMPORTANT: Stop Part I containers first!**

SSH to EC2:

```bash
cd ~/Interactive-Dashboard

# Stop Part I
docker-compose -f docker-compose-part1.yml down

# Verify all containers stopped
docker ps
# Should show no containers
```

**Now trigger Jenkins build:**

1. Go to Jenkins → Interactive-Dashboard-Pipeline
2. Click **"Build Now"**
3. Watch the build progress (click on #1 → Console Output)
4. You should see:
   - ✅ Checkout from GitHub
   - ✅ Docker Compose build
   - ✅ Containers starting
   - ✅ Build SUCCESS

**Verify deployment:**

```bash
# On EC2
docker ps
# Should show: interactive_dashboard_web_jenkins (port 8081)
#              interactive_dashboard_db_jenkins (port 3307)

# Test the application
curl http://localhost:8081/api/status
# Should return: {"status":"ok","notes":0}
```

**Test in browser:**
- **Part II Application:** http://34.229.173.85:8081

---

### Step 8: Test GitHub Webhook (5 minutes)

Make a change and push to GitHub:

```bash
# On your local machine
cd "e:\university\devops\minahas project\Interactive Dashboard"

# Make a small change
echo "# Webhook test" >> README.md

git add README.md
git commit -m "Test Jenkins webhook trigger"
git push origin main
```

**Watch Jenkins:**
- Go to Jenkins dashboard
- You should see a new build start automatically!
- Check console output - should be successful

---

### Step 9: Take Screenshots (15 minutes)

**For Part I:**
1. ✅ AWS EC2 instance details (running, 2/2 checks)
2. ✅ Security group inbound rules (ports 22, 3000, 8080, 8081)
3. ✅ SSH connected, `docker ps` showing Part I containers
4. ✅ Application in browser: http://34.229.173.85:3000
5. ✅ API response: http://34.229.173.85:3000/api/status
6. ✅ Docker Hub repository: https://hub.docker.com/r/minhasfarhat/interactive-dashboard

**For Part II:**
7. Jenkins initial setup screen
8. Installed plugins (Docker Pipeline)
9. Pipeline job configuration
10. GitHub webhook configuration (green ✓)
11. First manual build - Console Output showing SUCCESS
12. `docker ps` showing Part II containers (ports 8081, 3307)
13. Part II application in browser: http://34.229.173.85:8081
14. Webhook-triggered build (after git push)
15. GitHub webhook Recent Deliveries (200 OK)

---

### Step 10: Create Report (30 minutes)

Use `DEPLOYMENT_GUIDE.md` as template. Include:

**Section 1: Application Overview**
- Interactive Dashboard description
- Technology stack (Node.js, MySQL, D3.js, Docker)
- Features

**Section 2: Part I - Containerized Deployment**
- Dockerfile (include full code)
- docker-compose-part1.yml (include full code)
- Step-by-step AWS EC2 deployment
- Screenshots at each step
- Testing and verification

**Section 3: Part II - Jenkins Pipeline**
- docker-compose.yml (include full code)
- Jenkinsfile (include full code)
- Jenkins installation steps
- Pipeline configuration
- GitHub webhook setup
- Screenshots of builds

**Section 4: Testing & Verification**
- Part I accessible at http://34.229.173.85:3000
- Part II accessible at http://34.229.173.85:8081
- Jenkins at http://34.229.173.85:8080
- Webhook working (push triggers build)

**Section 5: Appendix**
- All code files
- Troubleshooting tips
- Commands reference

---

### Step 11: Submit (5 minutes)

**Fill Google Form:** https://forms.gle/ubA9DRzQSudr2qhY6

**Provide these URLs:**
- GitHub: https://github.com/minhas1278/Interactive-Dashboard
- Docker Hub: https://hub.docker.com/r/minhasfarhat/interactive-dashboard
- Part I: http://34.229.173.85:3000
- Jenkins: http://34.229.173.85:8080
- Part II: http://34.229.173.85:8081

**Attach:**
- Report (PDF/Word)
- All screenshots

---

## 📋 Quick Commands Reference

### Connect to EC2:
```bash
ssh -i ~/.ssh/assigment2.pem ubuntu@34.229.173.85
```

### Check containers:
```bash
docker ps
docker logs interactive_dashboard_web
docker logs interactive_dashboard_web_jenkins
```

### Part I - Start/Stop:
```bash
cd ~/Interactive-Dashboard
docker-compose -f docker-compose-part1.yml up -d
docker-compose -f docker-compose-part1.yml down
```

### Part II - Start/Stop:
```bash
cd ~/Interactive-Dashboard
docker-compose -f docker-compose.yml up -d
docker-compose -f docker-compose.yml down
```

### Jenkins:
```bash
sudo systemctl status jenkins
sudo systemctl restart jenkins
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

---

## ✅ Current URLs

| Service | URL | Status |
|---------|-----|--------|
| **EC2 Instance** | 34.229.173.85 | ✅ Running |
| **Part I App** | http://34.229.173.85:3000 | ✅ Working |
| **Part I API** | http://34.229.173.85:3000/api/status | ✅ Working |
| **Jenkins** | http://34.229.173.85:8080 | ⚠️ Need to start |
| **Part II App** | http://34.229.173.85:8081 | ⏳ Deploy via Jenkins |
| **Docker Hub** | https://hub.docker.com/r/minhasfarhat/interactive-dashboard | ✅ Available |
| **GitHub** | https://github.com/minhas1278/Interactive-Dashboard | ✅ Public |

---

## 🎯 Priority Actions (Next 1 Hour)

1. **Reboot EC2 instance** (in AWS Console)
2. **Wait 2 minutes**
3. **Connect via EC2 Instance Connect** (browser-based)
4. **Start Jenkins** (commands above)
5. **Open port 8080** in Security Group
6. **Access Jenkins UI** and complete setup
7. **Create pipeline job**
8. **Setup webhook**
9. **Test builds**
10. **Take screenshots**

---

## 💡 Tips

- **If EC2 Instance Connect still hangs:** Try rebooting again, or stop/start the instance
- **Part II must be DOWN initially:** Jenkins will start it
- **Don't run both Part I and Part II simultaneously:** t2.micro has limited RAM
- **Take screenshots as you go:** Don't wait until the end!
- **Test everything twice:** Manual build + webhook trigger

---

**You're 70% done! Just need to complete Jenkins setup, test, and document!** 🚀

**Estimated time remaining: 1.5 hours**

Good luck! 💪
