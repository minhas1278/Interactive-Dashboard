pipeline {
    agent any
    
    triggers {
        githubPush()
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out code from GitHub...'
                checkout scm
            }
        }
        
        stage('Build Test Container') {
            steps {
                echo 'Building Docker test image with Chrome and Selenium...'
                sh 'docker build -f Dockerfile.test -t dashboard-tests:${BUILD_NUMBER} .'
            }
        }
        
        stage('Run UI Tests') {
            steps {
                echo 'Running Selenium tests in Docker container...'
                sh 'mkdir -p ${WORKSPACE}/test-results'
                sh 'curl -s http://localhost:3000/api/status || echo "WARNING: App may not be running"'
                script {
                    def testResult = sh(
                        script: '''
                            docker run --rm \
                                --network host \
                                -e BASE_URL=http://localhost:3000 \
                                -v ${WORKSPACE}/test-results:/app/test-results \
                                dashboard-tests:${BUILD_NUMBER}
                        ''',
                        returnStatus: true
                    )
                    if (testResult != 0) {
                        echo "WARNING: Tests exited with code ${testResult}"
                        currentBuild.result = 'UNSTABLE'
                    }
                }
            }
            post {
                always {
                    archiveArtifacts artifacts: 'test-results/**/*', allowEmptyArchive: true
                    echo 'Test results archived. View report.html in build artifacts.'
                }
            }
        }
    }
    
    post {
        success {
            script {
                def committer = sh(returnStdout: true, script: "git log -1 --pretty=format:%an").trim()
                def email = sh(returnStdout: true, script: "git log -1 --pretty=format:%ae").trim()
                emailext(
                    subject: "✅ Jenkins Build SUCCESS - ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                    to: email,
                    mimeType: 'text/html',
                    body: """
                        <p>Hello ${committer},</p>
                        <p>Jenkins build <strong>#${env.BUILD_NUMBER}</strong> completed successfully.</p>
                        <p>✅ All Selenium UI tests passed!</p>
                        <p>View build details: <a href='${env.BUILD_URL}'>${env.BUILD_URL}</a></p>
                        <p>Test report: <a href='${env.BUILD_URL}Mochawesome_Test_Report/'>${env.BUILD_URL}Mochawesome_Test_Report/</a></p>
                        <p>Regards,<br/>Jenkins</p>
                    """
                )
            }
        }
        failure {
            script {
                def committer = sh(returnStdout: true, script: "git log -1 --pretty=format:%an").trim()
                def email = sh(returnStdout: true, script: "git log -1 --pretty=format:%ae").trim()
                emailext(
                    subject: "❌ Jenkins Build FAILED - ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                    to: email,
                    mimeType: 'text/html',
                    body: """
                        <p>Hello ${committer},</p>
                        <p>Jenkins build <strong>#${env.BUILD_NUMBER}</strong> failed.</p>
                        <p>❌ Please check the console output: <a href='${env.BUILD_URL}console'>${env.BUILD_URL}console</a></p>
                        <p>Regards,<br/>Jenkins</p>
                    """,
                    attachLog: true
                )
            }
        }
        always {
            sh 'docker rmi dashboard-tests:${BUILD_NUMBER} || true'
        }
    }
}
