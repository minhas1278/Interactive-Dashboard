# Assignment 2 - DevOps - Completion Checklist

## ✅ Part I: Containerized Deployment [4+1 marks]

### Local Development (✅ COMPLETED)
- [x] Create Dockerfile
- [x] Create docker-compose-part1.yml with database volume
- [x] Create .dockerignore file
- [x] Test locally - containers running successfully
- [x] Verify database persistence
- [x] Test API endpoints (http://localhost:3000/api/status)
- [x] Application working on http://localhost:3000

### Docker Hub (⚠️ PENDING - DO THIS NOW!)
- [ ] Create Docker Hub account / Login
- [ ] Tag image: `docker tag interactivedashboard-web:latest minhas1278/interactive-dashboard:latest`
- [ ] Push to Docker Hub: `docker push minhas1278/interactive-dashboard:latest`
- [ ] Verify image on Docker Hub: https://hub.docker.com/r/minhas1278/interactive-dashboard

### AWS EC2 Deployment (⚠️ TO DO)
- [ ] Launch EC2 instance (t2.micro)
- [ ] Configure Security Groups (SSH 22, HTTP 80, TCP 3000, TCP 3306)
- [ ] Connect to EC2 via SSH
- [ ] Install Docker on EC2
- [ ] Install Docker Compose on EC2
- [ ] Clone repository on EC2
- [ ] Run: `docker-compose -f docker-compose-part1.yml up -d`
- [ ] Test application: http://EC2-PUBLIC-IP:3000
- [ ] Take screenshots for report

---

## ✅ Part II: Jenkins Pipeline [4+1 marks]

### Files (✅ COMPLETED)
- [x] Create docker-compose.yml (with volume mount, different ports)
- [x] Create Jenkinsfile with pipeline script
- [x] Push all files to GitHub

### GitHub Setup (⚠️ PENDING - DO THIS!)
- [ ] Ensure code is pushed to GitHub: https://github.com/minhas1278/Interactive-Dashboard
- [ ] Add instructor as collaborator: qasimalik@gmail.com
- [ ] Grant "Write" access

### AWS EC2 Jenkins Setup (⚠️ TO DO)
- [ ] Launch EC2 instance (can use same as Part I or separate)
- [ ] Configure Security Group (add port 8080 for Jenkins, 8081 for app)
- [ ] Install Java on EC2: `sudo yum install java-17-amazon-corretto -y`
- [ ] Install Jenkins on EC2
- [ ] Start Jenkins: `sudo systemctl start jenkins`
- [ ] Access Jenkins: http://EC2-PUBLIC-IP:8080
- [ ] Get initial admin password: `sudo cat /var/lib/jenkins/secrets/initialAdminPassword`
- [ ] Complete Jenkins setup wizard
- [ ] Install plugins: Git, Pipeline, Docker Pipeline
- [ ] Add jenkins to docker group: `sudo usermod -aG docker jenkins`
- [ ] Restart Jenkins: `sudo systemctl restart jenkins`

### Jenkins Pipeline Configuration (⚠️ TO DO)
- [ ] Create new Pipeline job: "Interactive-Dashboard-Pipeline"
- [ ] Configure SCM: Git, Repository: https://github.com/minhas1278/Interactive-Dashboard.git
- [ ] Set branch: */main
- [ ] Set Script Path: Jenkinsfile
- [ ] Enable "GitHub hook trigger for GITScm polling"
- [ ] Save pipeline

### GitHub Webhook (⚠️ TO DO)
- [ ] Go to GitHub repo → Settings → Webhooks
- [ ] Add webhook: http://EC2-PUBLIC-IP:8080/github-webhook/
- [ ] Content type: application/json
- [ ] Events: Push events
- [ ] Save webhook

### Testing (⚠️ TO DO)
- [ ] Ensure Part II containers are DOWN initially (as per requirement)
- [ ] Click "Build Now" in Jenkins (first time)
- [ ] Verify pipeline runs successfully
- [ ] Check containers: `docker ps` (should show jenkins containers on ports 8081, 3307)
- [ ] Test application: http://EC2-PUBLIC-IP:8081
- [ ] Test webhook: Push a change to GitHub and verify Jenkins auto-triggers
- [ ] Take screenshots for report

---

## 📄 Report Submission (⚠️ TO DO)

### Documents to Include
- [ ] Application description
- [ ] Step-by-step documentation with screenshots
- [ ] Part I: Include Dockerfile and docker-compose-part1.yml
- [ ] Part II: Include docker-compose.yml and Jenkinsfile
- [ ] Screenshots of:
  - [ ] Docker Hub repository
  - [ ] EC2 instance details
  - [ ] Part I application running (http://EC2-IP:3000)
  - [ ] Jenkins dashboard
  - [ ] Pipeline job configuration
  - [ ] Successful pipeline build
  - [ ] GitHub webhook configuration
  - [ ] Part II application running (http://EC2-IP:8081)
  - [ ] Docker containers running (docker ps)
  - [ ] Database persistence verification

### Google Form Submission
- [ ] Fill form: https://forms.gle/ubA9DRzQSudr2qhY6
- [ ] Provide URLs for both parts:
  - Part I URL: http://EC2-PUBLIC-IP:3000
  - Part II URL: http://EC2-PUBLIC-IP:8081
  - Docker Hub URL: https://hub.docker.com/r/minhas1278/interactive-dashboard
  - GitHub URL: https://github.com/minhas1278/Interactive-Dashboard
- [ ] View responses: https://docs.google.com/spreadsheets/d/1TkLJfPSVe1xWh3RjrCKl0Kfzc_VAugOWXoUxbGoBej0

---

## 🎯 NEXT IMMEDIATE STEPS (DO NOW!)

### 1. Push to Docker Hub (5 minutes)
```powershell
# Get Docker Hub token from: https://app.docker.com/settings/personal-access-tokens
docker login -u minhas1278
# Paste token when prompted for password

# Push image (already tagged)
docker push minhas1278/interactive-dashboard:latest
```

### 2. Add GitHub Collaborator (2 minutes)
- Go to: https://github.com/minhas1278/Interactive-Dashboard/settings/access
- Click "Add people" → Enter: qasimalik@gmail.com → Select "Write" → Send invitation

### 3. Test Part II Locally (5 minutes)
```powershell
# Stop Part I containers first
docker-compose -f docker-compose-part1.yml down

# Start Part II containers
docker-compose -f docker-compose.yml up -d

# Verify
docker ps
# Check http://localhost:8081
```

### 4. AWS EC2 Deployment (30-60 minutes)
- Follow DEPLOYMENT_GUIDE.md step by step
- Take screenshots at each major step
- Test both Part I (port 3000) and Part II (port 8081)

---

## 📝 Important Notes

1. **Part II must be DOWN initially** - Instructor will trigger it via Jenkins
2. **Different ports required:**
   - Part I: Web 3000, DB 3306
   - Part II: Web 8081, DB 3307
3. **Different container names:**
   - Part I: `interactive_dashboard_web`, `interactive_dashboard_db`
   - Part II: `interactive_dashboard_web_jenkins`, `interactive_dashboard_db_jenkins`

---

## 💡 Quick Commands Reference

### Stop Part I
```powershell
docker-compose -f docker-compose-part1.yml down
```

### Start Part I
```powershell
docker-compose -f docker-compose-part1.yml up -d
```

### Stop Part II
```powershell
docker-compose -f docker-compose.yml down
```

### Start Part II
```powershell
docker-compose -f docker-compose.yml up -d
```

### View All Containers
```powershell
docker ps -a
```

### Clean Up Everything
```powershell
docker-compose -f docker-compose-part1.yml down -v
docker-compose -f docker-compose.yml down -v
docker system prune -a
```

---

## ✨ Evaluation Criteria

| Criteria | Marks | Status |
|----------|-------|--------|
| Part I: Containerized application running on EC2 | 4 | ⚠️ Pending |
| Part II: Pipeline triggered by GitHub push | 4 | ⚠️ Pending |
| Report with screenshots and steps | 2 | ⚠️ Pending |
| **Total** | **10** | **3/10 Done** |

---

**Current Progress: 30% Complete**
**Time to Complete: ~2-3 hours** (mostly AWS setup and documentation)
