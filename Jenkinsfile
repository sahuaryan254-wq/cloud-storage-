pipeline {
    agent { label 'new_agent' }

    environment {
        SERVER_IMAGE   = "arya51090/myapp-server"
        FRONTEND_IMAGE = "arya51090/myapp-frontend"
        TAG = "latest"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Docker Info (Debug)') {
            steps {
                sh '''
                docker --version
                docker info
                '''
            }
        }

        stage('Build Docker Images') {
            steps {
                sh '''
                echo "👉 Building Server Image"
                docker build -t ${SERVER_IMAGE}:${TAG} ./server

                echo "👉 Building Frontend Image"
                docker build -t ${FRONTEND_IMAGE}:${TAG} ./frontend

                echo "✅ Images built successfully"
                docker images | grep arya51090 || true
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

                    echo "👉 Pushing server image"
                    docker push ${SERVER_IMAGE}:${TAG}

                    echo "👉 Pushing frontend image"
                    docker push ${FRONTEND_IMAGE}:${TAG}
                    '''
                }
            }
        }

        stage('Deploy') {
            steps {
                sh '''
                echo "🚀 Deploying using docker-compose"

                docker-compose down || true
                docker-compose pull
                docker-compose up -d --remove-orphans

                docker ps
                '''
            }
        }
    }

    post {
        success {
            echo "✅ CI/CD Pipeline completed successfully"
        }
        failure {
            echo "❌ Pipeline failed — check above logs"
        }
    }
}
