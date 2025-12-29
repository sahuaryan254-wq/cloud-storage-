pipeline {
    agent { label 'new_agent' }

    environment {
        DOCKER_USERNAME = credentials('dockerhub-username')
        DOCKER_PASSWORD = credentials('dockerhub-password')

        SERVER_IMAGE   = 'arya51090/myapp-server'
        FRONTEND_IMAGE = 'arya51090/myapp-frontend'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
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

        stage('Docker Login') {
            steps {
                sh '''
                echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
                '''
            }
        }

        stage('Push Images') {
            steps {
                sh '''
                docker push $SERVER_IMAGE:latest
                docker push $FRONTEND_IMAGE:latest
                '''
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
