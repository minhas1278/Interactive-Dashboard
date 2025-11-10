# Quick Start Guide - Assignment 2

## 🚀 Quick Commands Reference

### Part I: Local Testing

```powershell
# 1. Build and start containers
docker-compose -f docker-compose-part1.yml up -d

# 2. Check status
docker ps
docker-compose -f docker-compose-part1.yml logs -f

# 3. Test application
# Open: http://localhost:3000
# API: http://localhost:3000/api/status

# 4. Stop containers
docker-compose -f docker-compose-part1.yml down
```

### Part I: Push to Docker Hub

```powershell
# 1. Login
docker login

# 2. Tag image
docker tag interactive-dashboard:latest YOUR_USERNAME/interactive-dashboard:latest

# 3. Push
docker push YOUR_USERNAME/interactive-dashboard:latest
```

### Part I: Deploy on AWS EC2

```bash
# On EC2 instance:

# 1. Install Docker
sudo yum update -y
sudo yum install docker -y
sudo systemctl start docker
sudo usermod -aG docker ec2-user

# 2. Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 3. Clone and deploy
git clone https://github.com/minhas1278/Interactive-Dashboard.git
cd Interactive-Dashboard
docker-compose -f docker-compose-part1.yml up -d

# 4. Access: http://YOUR_EC2_IP:3000
```

### Part II: Jenkins Setup on EC2

```bash
# 1. Install Java & Jenkins
sudo yum install java-17-amazon-corretto -y
sudo wget -O /etc/yum.repos.d/jenkins.repo https://pkg.jenkins.io/redhat-stable/jenkins.repo
sudo rpm --import https://pkg.jenkins.io/redhat-stable/jenkins.io-2023.key
sudo yum install jenkins -y
sudo systemctl start jenkins

# 2. Add Jenkins to Docker group
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins

# 3. Get admin password
sudo cat /var/lib/jenkins/secrets/initialAdminPassword

# 4. Access Jenkins: http://YOUR_EC2_IP:8080
```

### Part II: Test Pipeline

```powershell
# On local machine:

# 1. Make a change and push
echo "# Test" >> README.md
git add .
git commit -m "Test Jenkins pipeline"
git push origin main

# 2. Watch Jenkins automatically build
# Jenkins will deploy app on: http://YOUR_EC2_IP:8081
```

---

## 📋 Pre-Deployment Checklist

### Before Starting:
- [ ] Docker Desktop installed and running (Windows)
- [ ] Git installed and configured
- [ ] Docker Hub account created
- [ ] AWS account with EC2 access
- [ ] GitHub repository created
- [ ] Code pushed to GitHub

### Part I Checklist:
- [ ] Dockerfile created
- [ ] docker-compose-part1.yml created
- [ ] Tested locally (port 3000)
- [ ] Image built successfully
- [ ] Image pushed to Docker Hub
- [ ] EC2 instance launched with correct security groups
- [ ] Docker & Docker Compose installed on EC2
- [ ] Application deployed on EC2
- [ ] Database persistence verified

### Part II Checklist:
- [ ] docker-compose.yml created (different ports: 8081, 3307)
- [ ] Jenkinsfile created
- [ ] Jenkins installed on EC2
- [ ] Jenkins accessible on port 8080
- [ ] Required Jenkins plugins installed
- [ ] Pipeline job created in Jenkins
- [ ] GitHub repository linked to Jenkins
- [ ] Webhook configured in GitHub
- [ ] Instructor added as collaborator
- [ ] Webhook trigger tested
- [ ] Application accessible on port 8081

### Documentation:
- [ ] Screenshots taken for each step
- [ ] Report document prepared
- [ ] Docker Hub URL noted
- [ ] EC2 public IPs noted
- [ ] GitHub repository URL confirmed
- [ ] All files committed and pushed

---

## 🔗 Important URLs to Submit

**Part I:**
- Docker Hub: `https://hub.docker.com/r/YOUR_USERNAME/interactive-dashboard`
- EC2 Application: `http://YOUR_EC2_IP:3000`

**Part II:**
- GitHub Repo: `https://github.com/minhas1278/Interactive-Dashboard`
- Jenkins: `http://YOUR_EC2_IP:8080`
- Application: `http://YOUR_EC2_IP:8081`

**Submission Form:**
https://forms.gle/ubA9DRzQSudr2qhY6

---

## 🛠️ Troubleshooting

### Container won't start
```powershell
docker-compose -f docker-compose-part1.yml logs
docker logs interactive_dashboard_web
```

### Port conflict
```powershell
# Check what's using the port
netstat -ano | findstr :3000

# Change port in docker-compose.yml if needed
```

### Database connection fails
```bash
# Wait for MySQL to initialize (30-60 seconds)
# Check logs
docker logs interactive_dashboard_db

# Test connection
docker exec -it interactive_dashboard_db mysql -u myapp -pexamplepass -e "SHOW DATABASES;"
```

### Jenkins can't access Docker
```bash
# Add jenkins to docker group
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins

# Verify
sudo -u jenkins docker ps
```

### Webhook not triggering
- Check EC2 security group allows port 8080
- Verify webhook URL: `http://YOUR_EC2_IP:8080/github-webhook/`
- Check Jenkins System Log for webhook events

---

## 📊 Port Reference

| Service | Part I | Part II | Purpose |
|---------|--------|---------|---------|
| Web App | 3000 | 8081 | Application access |
| MySQL | 3306 | 3307 | Database access |
| Jenkins | - | 8080 | Jenkins UI |

---

## 🎯 Next Steps (In Order)

1. **Test locally first** - Run Part I docker-compose locally
2. **Push to Docker Hub** - Tag and push your image
3. **Set up AWS EC2** - Launch instance with proper security groups
4. **Deploy Part I** - Get Part I running on EC2
5. **Install Jenkins** - Set up Jenkins on EC2 (same or different instance)
6. **Create Pipeline** - Configure Jenkins job
7. **Set up Webhook** - Connect GitHub to Jenkins
8. **Test Pipeline** - Make a commit and watch it deploy
9. **Add Collaborator** - Add instructor (qasimalik@gmail.com)
10. **Take Screenshots** - Document every step
11. **Write Report** - Use DEPLOYMENT_GUIDE.md as template
12. **Submit** - Fill out Google Form with all URLs

---

**Good Luck! 🚀**
