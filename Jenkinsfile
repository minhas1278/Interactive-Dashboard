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
            // Optionally clean up old images
            sh 'docker system prune -f || true'
        }
    }
}
