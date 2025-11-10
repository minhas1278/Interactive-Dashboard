# Manual Steps Required - DO THESE YOURSELF

## 🔴 CRITICAL: Do These Steps Manually

### 1. Push to GitHub (When Ready)
```bash
git add .
git commit -m "Add Docker and Jenkins configuration for Assignment 2"
git push origin main
```

### 2. Add GitHub Collaborator
- Go to: https://github.com/minhas1278/Interactive-Dashboard/settings/access
- Click **"Add people"**
- Enter: **qasimalik@gmail.com**
- Select: **"Write"** permission
- Click **"Send invitation"**

---

## ✅ Completed Local Testing

### Part I - Docker Build (DONE ✅)
- ✅ Dockerfile created and tested
- ✅ docker-compose-part1.yml working
- ✅ Containers run successfully on ports 3000 & 3306
- ✅ Database persistence verified
- ✅ Image pushed to Docker Hub: `minhasfarhat/interactive-dashboard:latest`
- ✅ Accessible at: https://hub.docker.com/r/minhasfarhat/interactive-dashboard

### Part II - Jenkins Compose (DONE ✅)
- ✅ docker-compose.yml (Part II) created with volume mount
- ✅ Containers run successfully on ports 8081 & 3307
- ✅ Different container names (with _jenkins suffix)
- ✅ API tested and working
- ✅ Jenkinsfile created with complete pipeline

---

## 📋 AWS EC2 Deployment Steps

### Part I: Deploy Containerized Application

#### Step 1: Launch EC2 Instance
1. Go to AWS Console → EC2 → Launch Instance
2. **Name:** Interactive-Dashboard-Part1
3. **AMI:** Ubuntu Server 22.04 LTS (Free tier eligible)
4. **Instance Type:** t2.micro
5. **Key Pair:** Create new or use existing
6. **Security Group:** Create/Configure:
   - SSH (22) - Your IP only
   - HTTP (80) - 0.0.0.0/0
   - Custom TCP (3000) - 0.0.0.0/0
   - Custom TCP (3306) - Your IP only (optional)
7. **Storage:** 8 GB (default)
8. Click **"Launch Instance"**

#### Step 2: Connect to EC2
```bash
ssh -i "your-key.pem" ubuntu@your-ec2-public-ip
```

#### Step 3: Install Docker & Docker Compose
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
sudo apt install docker.io -y
sudo systemctl start docker
sudo systemctl enable docker

# Add user to docker group
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installations
docker --version
docker-compose --version

# Log out and back in for group changes
exit
```

#### Step 4: Clone Repository and Deploy
```bash
# Reconnect to EC2
ssh -i "your-key.pem" ubuntu@your-ec2-public-ip

# Clone repository
git clone https://github.com/minhas1278/Interactive-Dashboard.git
cd Interactive-Dashboard

# Deploy Part I
docker-compose -f docker-compose-part1.yml up -d

# Check logs
docker-compose -f docker-compose-part1.yml logs -f

# Wait for "DB ready" and "App listening on port 3000"
```

#### Step 5: Test Part I
```bash
# Test from EC2
curl http://localhost:3000/api/status

# Test from browser
# Open: http://YOUR-EC2-PUBLIC-IP:3000
```

#### Step 6: Take Screenshots
- [ ] EC2 instance details (public IP, security groups)
- [ ] SSH connected to EC2
- [ ] Docker & Docker Compose versions
- [ ] `docker ps` output showing running containers
- [ ] Application in browser (http://EC2-IP:3000)
- [ ] API response (http://EC2-IP:3000/api/status)
- [ ] Test database persistence (add note, restart, verify)

---

### Part II: Jenkins Pipeline Setup

#### Step 1: Launch EC2 for Jenkins (or use same instance)
Same as Part I, but add security group rule:
- **Custom TCP (8080)** - 0.0.0.0/0 (for Jenkins UI)
- **Custom TCP (8081)** - 0.0.0.0/0 (for Part II app)

#### Step 2: Install Jenkins
```bash
# Install Java
sudo apt install fontconfig openjdk-17-jre -y
java -version

# Add Jenkins repository
sudo wget -O /usr/share/keyrings/jenkins-keyring.asc \
  https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key
echo "deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc]" \
  https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null

# Install Jenkins
sudo apt-get update
sudo apt-get install jenkins -y

# Start Jenkins
sudo systemctl start jenkins
sudo systemctl enable jenkins
sudo systemctl status jenkins

# Get initial admin password
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

#### Step 3: Configure Jenkins
1. Open browser: `http://YOUR-EC2-PUBLIC-IP:8080`
2. Enter initial admin password
3. Click **"Install suggested plugins"**
4. Create admin user
5. Configure Jenkins URL: `http://YOUR-EC2-PUBLIC-IP:8080`

#### Step 4: Install Additional Plugins
1. Go to: **Manage Jenkins** → **Plugins** → **Available plugins**
2. Search and install:
   - **Docker Pipeline**
   - **Git plugin** (should be pre-installed)
3. Click **"Install"** (no restart needed)

#### Step 5: Add Jenkins to Docker Group
```bash
# On EC2
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins

# Verify
sudo -u jenkins docker ps
```

#### Step 6: Create Pipeline Job
1. Click **"New Item"**
2. Name: `Interactive-Dashboard-Pipeline`
3. Type: **Pipeline**
4. Click **OK**

**Configure Pipeline:**
- **Description:** "Automated deployment for Interactive Dashboard"
- **Build Triggers:** ☑ **GitHub hook trigger for GITScm polling**
- **Pipeline:**
  - **Definition:** Pipeline script from SCM
  - **SCM:** Git
  - **Repository URL:** `https://github.com/minhas1278/Interactive-Dashboard.git`
  - **Branch:** `*/main`
  - **Script Path:** `Jenkinsfile`
- Click **Save**

#### Step 7: Setup GitHub Webhook
1. Go to: https://github.com/minhas1278/Interactive-Dashboard/settings/hooks
2. Click **"Add webhook"**
3. **Payload URL:** `http://YOUR-EC2-PUBLIC-IP:8080/github-webhook/`
4. **Content type:** `application/json`
5. **Events:** ☑ Just the push event
6. **Active:** ☑
7. Click **"Add webhook"**

#### Step 8: Test Pipeline
```bash
# Ensure Part II is DOWN initially (as per requirement)
docker-compose -f docker-compose.yml down
```

1. Go to Jenkins → Interactive-Dashboard-Pipeline
2. Click **"Build Now"**
3. Watch the stages execute
4. Check console output for success

#### Step 9: Verify Deployment
```bash
# Check containers
docker ps

# Test locally
curl http://localhost:8081/api/status

# Test from browser
# Open: http://YOUR-EC2-PUBLIC-IP:8081
```

#### Step 10: Test GitHub Webhook Trigger
```bash
# On local machine, make a change
echo "# Webhook test" >> README.md
git add README.md
git commit -m "Test Jenkins webhook trigger"
git push origin main

# Watch Jenkins automatically start a new build
```

#### Step 11: Take Screenshots
- [ ] Jenkins initial setup screen
- [ ] Installed plugins list
- [ ] Pipeline job configuration
- [ ] GitHub webhook configuration
- [ ] First manual build (Build Now) - console output
- [ ] Successful pipeline run with all stages
- [ ] `docker ps` showing Jenkins containers on 8081, 3307
- [ ] Application in browser (http://EC2-IP:8081)
- [ ] Webhook-triggered build
- [ ] GitHub webhook delivery status (Recent Deliveries)

---

## 📝 Report Preparation

### Document Structure
1. **Cover Page**
   - Course name, assignment title
   - Your name, roll number
   - Date

2. **Application Overview**
   - Brief description of Interactive Dashboard
   - Technology stack
   - Features

3. **Part I: Containerized Deployment**
   - Dockerfile explanation
   - docker-compose-part1.yml explanation
   - Step-by-step deployment on AWS EC2
   - Screenshots at each step
   - Testing and verification
   - Database persistence proof

4. **Part II: Jenkins CI/CD Pipeline**
   - docker-compose.yml (Part II) explanation
   - Jenkinsfile breakdown
   - Jenkins installation steps
   - Pipeline configuration
   - GitHub webhook setup
   - Screenshots of builds and deployments

5. **Appendix**
   - Full Dockerfile
   - Full docker-compose-part1.yml
   - Full docker-compose.yml
   - Full Jenkinsfile
   - Troubleshooting tips

### Include These Files
- ✅ Dockerfile
- ✅ docker-compose-part1.yml (Part I)
- ✅ docker-compose.yml (Part II)
- ✅ Jenkinsfile
- ✅ .dockerignore

---

## 🔗 Submission URLs

### Google Form
Fill out: https://forms.gle/ubA9DRzQSudr2qhY6

**URLs to provide:**
- GitHub Repository: `https://github.com/minhas1278/Interactive-Dashboard`
- Docker Hub Image: `https://hub.docker.com/r/minhasfarhat/interactive-dashboard`
- Part I Live URL: `http://YOUR-EC2-PUBLIC-IP:3000`
- Part II Jenkins URL: `http://YOUR-EC2-PUBLIC-IP:8080`
- Part II App URL: `http://YOUR-EC2-PUBLIC-IP:8081`

### Response Sheet
View your submission: https://docs.google.com/spreadsheets/d/1TkLJfPSVe1xWh3RjrCKl0Kfzc_VAugOWXoUxbGoBej0

---

## ✅ Pre-Deployment Checklist

### Local Files Ready
- [x] Dockerfile created
- [x] docker-compose-part1.yml created
- [x] docker-compose.yml (Part II) created
- [x] Jenkinsfile created
- [x] .dockerignore created
- [x] All documentation files created
- [x] Docker image pushed to Docker Hub
- [x] Part I tested locally (port 3000)
- [x] Part II tested locally (port 8081)

### GitHub Ready
- [ ] All files committed
- [ ] Pushed to GitHub
- [ ] Repository is public or instructor added as collaborator

### AWS Preparation
- [ ] AWS account ready
- [ ] EC2 key pair downloaded
- [ ] Security groups planned

### Submission Ready
- [ ] Part I deployed on EC2 (port 3000)
- [ ] Part II Jenkins deployed on EC2 (port 8080)
- [ ] Pipeline working
- [ ] Webhook tested
- [ ] All screenshots taken
- [ ] Report written
- [ ] Google form filled

---

## 🎯 Quick Test Commands

### Test Part I Locally
```powershell
docker-compose -f docker-compose-part1.yml up -d
curl http://localhost:3000/api/status
docker-compose -f docker-compose-part1.yml down
```

### Test Part II Locally
```powershell
docker-compose -f docker-compose.yml up -d
curl http://localhost:8081/api/status
docker-compose -f docker-compose.yml down
```

### Test on EC2
```bash
# Part I
curl http://localhost:3000/api/status
# Part II
curl http://localhost:8081/api/status
```

---

## ⏰ Time Estimate

- AWS EC2 Part I Setup: **30 minutes**
- AWS EC2 Jenkins Setup: **45 minutes**
- Testing & Screenshots: **30 minutes**
- Report Writing: **60 minutes**
- **Total: ~3 hours**

---

## 💡 Important Notes

1. **Part II containers must be DOWN initially** - The instructor will trigger the pipeline
2. **Different ports are critical:**
   - Part I: 3000, 3306
   - Part II: 8081, 3307
3. **Don't forget to add instructor as GitHub collaborator!**
4. **Take screenshots BEFORE and AFTER each major step**
5. **Test database persistence for Part I**
6. **Test webhook trigger for Part II**

---

## 🆘 Need Help?

### Common Issues

**Port already in use:**
```bash
# Check what's using the port
sudo lsof -i :3000
# Stop containers
docker-compose -f docker-compose-part1.yml down
```

**Jenkins can't access Docker:**
```bash
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

**Webhook not working:**
- Check EC2 security group allows inbound on 8080
- Verify webhook URL ends with `/github-webhook/`
- Check Jenkins logs: `sudo journalctl -u jenkins -f`

**Database connection issues:**
- Wait 30-60 seconds for MySQL to initialize
- Check logs: `docker-compose logs db`
- Verify environment variables match

---

**Good luck with your deployment! 🚀**
