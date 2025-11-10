# DevOps Assignment - Containerized Web Application Deployment
## Student: [Your Name]
## Course: CSC483 - Topics in Computer Science II (DevOps)
## Assignment 2 - Fall 2025

---

## Table of Contents
1. [Application Overview](#application-overview)
2. [Part I: Containerized Deployment](#part-i-containerized-deployment)
3. [Part II: Jenkins CI/CD Pipeline](#part-ii-jenkins-cicd-pipeline)
4. [Appendix](#appendix)

---

## Application Overview

**Application Name:** Interactive Dashboard (MovieViz)

**Description:** A web-based interactive dashboard for visualizing movie data with D3.js charts. The application uses Node.js/Express backend with MySQL database for storing user notes and application data.

**Technology Stack:**
- **Frontend:** HTML5, CSS3, JavaScript (ES6), D3.js
- **Backend:** Node.js, Express.js
- **Database:** MySQL 8.0
- **Containerization:** Docker, Docker Compose
- **CI/CD:** Jenkins
- **Cloud Platform:** AWS EC2

**Key Features:**
- Interactive data visualizations (Bar, Line, Scatter, Pie, Donut charts)
- Dynamic filtering by genre and year
- Database integration for persistent notes
- RESTful API endpoints
- Logging with Morgan

---

## Part I: Containerized Deployment

### Objective
Deploy the web application on AWS EC2 using Docker containers with persistent database storage.

### Files Created

#### 1. Dockerfile
```dockerfile
FROM node:18-alpine
WORKDIR /app

# copy package files first for caching
COPY package*.json ./

# use CI for reproducible installs and show logs
RUN npm ci --only=production --no-audit --loglevel=info

# application source
COPY . .

ENV PORT=3000
EXPOSE 3000

CMD ["node", "index.js"]
```

**Explanation:**
- Uses Node.js 18 Alpine (lightweight base image)
- Installs production dependencies first (layer caching optimization)
- Copies application source code
- Exposes port 3000
- Runs the application with `index.js` which includes MySQL integration

#### 2. docker-compose-part1.yml
```yaml
version: '3.8'

services:
  web:
    build: .
    container_name: interactive_dashboard_web
    ports:
      - "3000:3000"
    environment:
      - PORT=3000
      - DB_HOST=db
      - DB_PORT=3306
      - DB_NAME=myappdb
      - DB_USER=myapp
      - DB_PASS=examplepass
    depends_on:
      - db
    networks:
      - app_network
    restart: unless-stopped

  db:
    image: mysql:8.0
    container_name: interactive_dashboard_db
    environment:
      MYSQL_ROOT_PASSWORD: rootpass
      MYSQL_DATABASE: myappdb
      MYSQL_USER: myapp
      MYSQL_PASSWORD: examplepass
    volumes:
      - db_data:/var/lib/mysql    # Persistent volume for database
    ports:
      - "3306:3306"
    networks:
      - app_network
    restart: unless-stopped

volumes:
  db_data:    # Named volume for data persistence

networks:
  app_network:
    driver: bridge
```

**Key Points:**
- Two services: web (Node.js app) and db (MySQL)
- **Persistent volume** `db_data` attached to MySQL container
- Environment variables for database connection
- Custom network for service communication

#### 3. .dockerignore
```
node_modules
npm-debug.log
.git
.gitignore
README.md
.env
.DS_Store
logs/
*.log
```

---

### Step-by-Step Implementation

#### Step 1: Local Testing

1. **Test Docker Build Locally**
   ```powershell
   docker build -t interactive-dashboard:latest .
   ```

2. **Start Services with Docker Compose**
   ```powershell
   docker-compose -f docker-compose-part1.yml up -d
   ```

3. **Verify Containers are Running**
   ```powershell
   docker ps
   docker-compose -f docker-compose-part1.yml logs
   ```

4. **Test Application**
   - Open browser: http://localhost:3000
   - Test API endpoints:
     - http://localhost:3000/api/status
     - http://localhost:3000/api/notes

5. **Verify Database Persistence**
   ```powershell
   # Add a note via API
   curl -X POST http://localhost:3000/api/notes -H "Content-Type: application/json" -d "{\"text\":\"Test note\"}"
   
   # Stop and restart containers
   docker-compose -f docker-compose-part1.yml down
   docker-compose -f docker-compose-part1.yml up -d
   
   # Check if note persists
   curl http://localhost:3000/api/notes
   ```

**Screenshot Placeholder:** [Insert screenshot of running containers with `docker ps`]

---

#### Step 2: Push Image to Docker Hub

1. **Login to Docker Hub**
   ```powershell
   docker login
   # Enter your Docker Hub username and password
   ```

2. **Tag the Image**
   ```powershell
   docker tag interactive-dashboard:latest YOUR_DOCKERHUB_USERNAME/interactive-dashboard:latest
   docker tag interactive-dashboard:latest YOUR_DOCKERHUB_USERNAME/interactive-dashboard:v1.0
   ```

3. **Push to Docker Hub**
   ```powershell
   docker push YOUR_DOCKERHUB_USERNAME/interactive-dashboard:latest
   docker push YOUR_DOCKERHUB_USERNAME/interactive-dashboard:v1.0
   ```

4. **Verify on Docker Hub**
   - Visit: https://hub.docker.com/r/YOUR_DOCKERHUB_USERNAME/interactive-dashboard

**Screenshot Placeholder:** [Insert screenshot of Docker Hub repository]

---

#### Step 3: AWS EC2 Setup

1. **Launch EC2 Instance**
   - Go to AWS Console → EC2 → Launch Instance
   - **AMI:** Amazon Linux 2 or Ubuntu 22.04
   - **Instance Type:** t2.micro (free tier)
   - **Security Group:** 
     - SSH (port 22) from your IP
     - HTTP (port 80)
     - Custom TCP (port 3000) from 0.0.0.0/0
     - Custom TCP (port 3306) from within VPC only (optional)
   - **Key Pair:** Create or use existing key pair
   - Launch instance

**Screenshot Placeholder:** [Insert screenshot of EC2 instance details]

2. **Connect to EC2 Instance**
   ```powershell
   ssh -i "your-key.pem" ec2-user@your-ec2-public-ip
   ```

3. **Install Docker on EC2**
   ```bash
   # Update system
   sudo yum update -y
   
   # Install Docker
   sudo yum install docker -y
   
   # Start Docker service
   sudo systemctl start docker
   sudo systemctl enable docker
   
   # Add user to docker group
   sudo usermod -aG docker ec2-user
   
   # Logout and login again for group changes to take effect
   exit
   ```

4. **Install Docker Compose**
   ```bash
   sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   docker-compose --version
   ```

5. **Clone Repository on EC2**
   ```bash
   git clone https://github.com/minhas1278/Interactive-Dashboard.git
   cd Interactive-Dashboard
   ```

6. **Deploy Application**
   ```bash
   # Build and start containers
   docker-compose -f docker-compose-part1.yml up -d
   
   # Check status
   docker ps
   docker-compose -f docker-compose-part1.yml logs -f
   ```

7. **Access Application**
   - Open browser: http://your-ec2-public-ip:3000

**Screenshot Placeholder:** [Insert screenshot of application running on EC2]

---

#### Step 4: Verify Database Persistence

1. **Create Test Data**
   ```bash
   curl -X POST http://your-ec2-public-ip:3000/api/notes \
     -H "Content-Type: application/json" \
     -d '{"text":"Persistent test note from EC2"}'
   ```

2. **Restart Containers**
   ```bash
   docker-compose -f docker-compose-part1.yml down
   docker-compose -f docker-compose-part1.yml up -d
   ```

3. **Verify Data Persists**
   ```bash
   curl http://your-ec2-public-ip:3000/api/notes
   ```

**Screenshot Placeholder:** [Insert screenshot showing data persistence]

---

## Part II: Jenkins CI/CD Pipeline

### Objective
Create a Jenkins pipeline that automatically fetches code from GitHub and deploys the application in a containerized environment.

### Files Created

#### 1. docker-compose.yml (For Jenkins Build)
```yaml
version: '3.8'

services:
  web_jenkins:
    image: node:18-alpine
    container_name: interactive_dashboard_web_jenkins
    working_dir: /app
    volumes:
      - ./:/app:cached           # mount repository code into container (code volume)
      - /app/node_modules        # anonymous volume for node_modules inside container
    command: sh -c "npm ci --production && node index.js"
    ports:
      - "8081:3000"              # different host port than Part-I
    environment:
      - PORT=3000
      - DB_HOST=db_jenkins
      - DB_PORT=3306
      - DB_NAME=myappdb
      - DB_USER=myapp
      - DB_PASS=examplepass
    depends_on:
      - db_jenkins
    networks:
      - jenkins_network

  db_jenkins:
    image: mysql:8.0
    container_name: interactive_dashboard_db_jenkins
    environment:
      MYSQL_ROOT_PASSWORD: rootpass
      MYSQL_DATABASE: myappdb
      MYSQL_USER: myapp
      MYSQL_PASSWORD: examplepass
    volumes:
      - db_jenkins_data:/var/lib/mysql
    ports:
      - "3307:3306"              # host port different to Part-I
    networks:
      - jenkins_network

volumes:
  db_jenkins_data:

networks:
  jenkins_network:
    driver: bridge
```

**Key Differences from Part I:**
- Uses **volume mount** for code instead of building image
- Different port numbers (8081 for web, 3307 for db)
- Different container names (with `_jenkins` suffix)
- Direct npm install and run command

#### 2. Jenkinsfile
```groovy
pipeline {
    agent any
    
    environment {
        DOCKER_COMPOSE_FILE = 'docker-compose.yml'
        PROJECT_NAME = 'interactive-dashboard'
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out code from GitHub...'
                checkout scm
            }
        }
        
        stage('Environment Info') {
            steps {
                echo 'Displaying environment information...'
                sh '''
                    echo "Current directory: $(pwd)"
                    echo "Docker version:"
                    docker --version
                    echo "Docker Compose version:"
                    docker-compose --version
                    echo "Git commit: ${GIT_COMMIT}"
                    echo "Git branch: ${GIT_BRANCH}"
                '''
            }
        }
        
        stage('Stop Previous Containers') {
            steps {
                echo 'Stopping any existing containers...'
                sh '''
                    docker-compose -f ${DOCKER_COMPOSE_FILE} down || true
                '''
            }
        }
        
        stage('Build') {
            steps {
                echo 'Building application with Docker Compose...'
                sh '''
                    docker-compose -f ${DOCKER_COMPOSE_FILE} build --no-cache
                '''
            }
        }
        
        stage('Deploy') {
            steps {
                echo 'Starting containers...'
                sh '''
                    docker-compose -f ${DOCKER_COMPOSE_FILE} up -d
                '''
            }
        }
        
        stage('Verify Deployment') {
            steps {
                echo 'Verifying containers are running...'
                sh '''
                    echo "Running containers:"
                    docker-compose -f ${DOCKER_COMPOSE_FILE} ps
                    
                    echo "\nContainer logs (web service):"
                    docker-compose -f ${DOCKER_COMPOSE_FILE} logs --tail=50 web_jenkins
                '''
            }
        }
    }
    
    post {
        success {
            echo 'Pipeline completed successfully!'
            echo 'Application is running on port 8081'
        }
        failure {
            echo 'Pipeline failed!'
            sh '''
                echo "Checking logs for debugging..."
                docker-compose -f ${DOCKER_COMPOSE_FILE} logs
            '''
        }
        always {
            echo 'Cleaning up...'
            sh 'docker system prune -f || true'
        }
    }
}
```

---

### Step-by-Step Implementation

#### Step 1: Prepare GitHub Repository

1. **Push all files to GitHub**
   ```powershell
   git add .
   git commit -m "Add Docker and Jenkins configuration"
   git push origin main
   ```

2. **Add Instructor as Collaborator**
   - Go to: https://github.com/minhas1278/Interactive-Dashboard/settings/access
   - Click "Add people"
   - Enter: qasimalik@gmail.com
   - Select "Write" permission
   - Send invitation

**Screenshot Placeholder:** [Insert screenshot of GitHub collaborator invitation]

---

#### Step 2: Set Up Jenkins on AWS EC2

1. **Launch New EC2 Instance (or use existing)**
   - Same configuration as Part I
   - Additional security group rule: Custom TCP port 8080 (Jenkins UI)

2. **Install Jenkins**
   ```bash
   # Install Java
   sudo yum install java-17-amazon-corretto -y
   
   # Add Jenkins repository
   sudo wget -O /etc/yum.repos.d/jenkins.repo https://pkg.jenkins.io/redhat-stable/jenkins.repo
   sudo rpm --import https://pkg.jenkins.io/redhat-stable/jenkins.io-2023.key
   
   # Install Jenkins
   sudo yum install jenkins -y
   
   # Start Jenkins
   sudo systemctl start jenkins
   sudo systemctl enable jenkins
   
   # Check status
   sudo systemctl status jenkins
   ```

3. **Access Jenkins**
   - Open browser: http://your-ec2-public-ip:8080

4. **Get Initial Admin Password**
   ```bash
   sudo cat /var/lib/jenkins/secrets/initialAdminPassword
   ```

5. **Complete Jenkins Setup**
   - Enter initial admin password
   - Install suggested plugins
   - Create admin user
   - Configure Jenkins URL

**Screenshot Placeholder:** [Insert screenshot of Jenkins dashboard]

---

#### Step 3: Configure Jenkins

1. **Install Required Plugins**
   - Go to: Manage Jenkins → Plugins → Available plugins
   - Search and install:
     - Git plugin (usually pre-installed)
     - Pipeline plugin (usually pre-installed)
     - Docker Pipeline
   - Restart Jenkins if needed

**Screenshot Placeholder:** [Insert screenshot of installed plugins]

2. **Add Jenkins User to Docker Group**
   ```bash
   sudo usermod -aG docker jenkins
   sudo systemctl restart jenkins
   ```

3. **Verify Docker Access**
   ```bash
   sudo -u jenkins docker ps
   ```

---

#### Step 4: Create Jenkins Pipeline Job

1. **Create New Pipeline**
   - Click "New Item"
   - Name: "Interactive-Dashboard-Pipeline"
   - Type: Pipeline
   - Click OK

2. **Configure Pipeline**
   - **General:**
     - Description: "Automated build and deployment for Interactive Dashboard"
   
   - **Build Triggers:**
     - ☑ GitHub hook trigger for GITScm polling
   
   - **Pipeline:**
     - Definition: Pipeline script from SCM
     - SCM: Git
     - Repository URL: https://github.com/minhas1278/Interactive-Dashboard.git
     - Branch: */main
     - Script Path: Jenkinsfile
   
   - Save

**Screenshot Placeholder:** [Insert screenshot of pipeline configuration]

---

#### Step 5: Set Up GitHub Webhook

1. **Get Jenkins Webhook URL**
   - Format: http://your-ec2-public-ip:8080/github-webhook/

2. **Configure GitHub Webhook**
   - Go to: GitHub Repository → Settings → Webhooks
   - Click "Add webhook"
   - Payload URL: http://your-ec2-public-ip:8080/github-webhook/
   - Content type: application/json
   - Events: Just the push event
   - Active: ☑
   - Add webhook

**Screenshot Placeholder:** [Insert screenshot of GitHub webhook configuration]

---

#### Step 6: Test the Pipeline

1. **Manual Trigger (First Run)**
   - Go to Jenkins → Interactive-Dashboard-Pipeline
   - Click "Build Now"
   - Watch the pipeline stages execute

**Screenshot Placeholder:** [Insert screenshot of successful pipeline run]

2. **Verify Deployment**
   ```bash
   docker ps
   curl http://localhost:8081/api/status
   ```

3. **Test Webhook Trigger**
   - Make a change to code:
     ```powershell
     # On local machine
     echo "# Test webhook trigger" >> README.md
     git add README.md
     git commit -m "Test Jenkins webhook"
     git push origin main
     ```
   - Watch Jenkins automatically start a new build

**Screenshot Placeholder:** [Insert screenshot of webhook-triggered build]

4. **Access Application**
   - Open browser: http://your-ec2-public-ip:8081

**Screenshot Placeholder:** [Insert screenshot of running application on port 8081]

---

## Testing & Verification

### Part I Verification Checklist
- ☑ Dockerfile builds successfully
- ☑ Docker Compose starts both web and db containers
- ☑ Web application accessible on port 3000
- ☑ Database connection working (test /api/status endpoint)
- ☑ Data persists after container restart
- ☑ Image pushed to Docker Hub
- ☑ Application deployed and running on AWS EC2

### Part II Verification Checklist
- ☑ Jenkinsfile syntax is valid
- ☑ Jenkins pipeline job created
- ☑ Pipeline successfully clones from GitHub
- ☑ Docker containers build and start via Jenkins
- ☑ Application accessible on port 8081 (different from Part I)
- ☑ GitHub webhook triggers Jenkins build on push
- ☑ Instructor added as GitHub collaborator

---

## Appendix

### Useful Commands

**Docker Commands:**
```powershell
# Build image
docker build -t interactive-dashboard .

# Run container
docker run -p 3000:3000 interactive-dashboard

# View running containers
docker ps

# View logs
docker logs container_name

# Stop container
docker stop container_name

# Remove container
docker rm container_name

# Remove image
docker rmi interactive-dashboard
```

**Docker Compose Commands:**
```powershell
# Start services (detached)
docker-compose -f docker-compose-part1.yml up -d

# Stop services
docker-compose -f docker-compose-part1.yml down

# View logs
docker-compose -f docker-compose-part1.yml logs -f

# Rebuild and start
docker-compose -f docker-compose-part1.yml up --build -d

# Check status
docker-compose -f docker-compose-part1.yml ps
```

**Jenkins Commands:**
```bash
# Check Jenkins status
sudo systemctl status jenkins

# Restart Jenkins
sudo systemctl restart jenkins

# View Jenkins logs
sudo journalctl -u jenkins -f
```

### Troubleshooting

**Issue: Database connection refused**
- Solution: Ensure containers are on the same network
- Check environment variables match in both services
- Wait for MySQL to fully initialize (may take 30-60 seconds)

**Issue: Port already in use**
- Solution: Stop conflicting service or use different port
- Check with: `netstat -an | findstr :3000`

**Issue: Jenkins cannot access Docker**
- Solution: Add jenkins user to docker group
- Command: `sudo usermod -aG docker jenkins`
- Restart Jenkins: `sudo systemctl restart jenkins`

**Issue: GitHub webhook not triggering**
- Ensure EC2 security group allows inbound on port 8080
- Verify webhook URL is correct and publicly accessible
- Check Jenkins logs for webhook events

---

### Repository Structure
```
Interactive-Dashboard/
├── Dockerfile                      # Part I: Docker image definition
├── docker-compose-part1.yml        # Part I: Docker Compose for manual deployment
├── docker-compose.yml              # Part II: Docker Compose for Jenkins
├── Jenkinsfile                     # Part II: Jenkins pipeline script
├── .dockerignore                   # Files to exclude from Docker build
├── package.json                    # Node.js dependencies
├── index.js                        # Main application file (with DB)
├── server.js                       # Simple server (without DB)
├── index.html                      # Frontend HTML
├── css/
│   └── styles.css
├── js/
│   ├── main.js
│   ├── dataLoader.js
│   ├── uiController.js
│   ├── charts/
│   │   ├── BarChart.js
│   │   ├── LineChart.js
│   │   ├── ScatterPlot.js
│   │   ├── DonutChart.js
│   │   └── PieChart.js
│   └── utils/
│       └── tooltip.js
├── data/
│   └── movies.csv
└── README.md
```

---

### Submission Links

**Part I - Live Application:**
- Docker Hub: https://hub.docker.com/r/YOUR_USERNAME/interactive-dashboard
- EC2 Application: http://your-ec2-ip:3000

**Part II - Jenkins Pipeline:**
- GitHub Repository: https://github.com/minhas1278/Interactive-Dashboard
- Jenkins Dashboard: http://your-ec2-ip:8080
- EC2 Application (Jenkins deployed): http://your-ec2-ip:8081

---

## Conclusion

This assignment successfully demonstrates:
1. Containerization of a full-stack web application with Docker
2. Database persistence using Docker volumes
3. Deployment to AWS EC2 infrastructure
4. CI/CD automation using Jenkins
5. GitHub integration with webhook triggers
6. Best practices for DevOps workflows

The application is fully functional, containerized, and automatically deployable through the Jenkins pipeline.

---

**Date:** November 10, 2025
**Student:** [Your Name]
**Roll No:** [Your Roll Number]
