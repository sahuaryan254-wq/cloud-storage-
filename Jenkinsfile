pipeline {
    agent { label 'new_agent' }

    environment {
        SERVER_IMAGE   = 'arya51090/myapp-server'
        FRONTEND_IMAGE = 'arya51090/myapp-frontend'
    }

    stages {

        stage('Checkout Code') {
            steps {
                withCredentials([
                    string(
                        credentialsId: 'github-token',
                        variable: 'GITHUB_TOKEN'
                    )
                ]) {
                    checkout([
                        $class: 'GitSCM',
                        branches: [[name: '*/main']],
                        userRemoteConfigs: [[
                            url: 'https://github.com/sahuaryan254-wq/cloud-storage-.git',
                            credentialsId: 'github-token'
                        ]]
                    ])
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                sh '''
                docker build -t $SERVER_IMAGE:latest ./server
                docker build -t $FRONTEND_IMAGE:latest ./frontend
                '''
            }
        }

        stage('Docker Login & Push') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )
                ]) {
                    sh '''
                    echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                    docker push $SERVER_IMAGE:latest
                    docker push $FRONTEND_IMAGE:latest
                    '''
                }
            }
        }

        stage('Deploy') {
            steps {
                sh '''
                docker-compose down || true
                docker-compose pull
                docker-compose up -d
                '''
            }
        }
    }

    post {
        success {
            echo "✅ Deployment successful"
        }
        failure {
            echo "❌ Deployment failed"
        }
        always {
            echo "Pipeline finished"
        }
    }
}
