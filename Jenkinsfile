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

        stage('Docker Debug Info') {
            steps {
                sh '''
                echo "🐳 Docker Version:"
                docker --version

                echo "📦 Docker Info:"
                docker info || true
                '''
            }
        }

        stage('Build Images') {
            steps {
                sh '''
                echo "🔨 Building backend image"
                docker build -t ${SERVER_IMAGE}:${TAG} ./server

                echo "🔨 Building frontend image"
                docker build -t ${FRONTEND_IMAGE}:${TAG} ./frontend

                echo "✅ Images built:"
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

                    docker push ${SERVER_IMAGE}:${TAG}
                    docker push ${FRONTEND_IMAGE}:${TAG}
                    '''
                }
            }
        }

        stage('Deploy (Auto Restart Enabled)') {
            steps {
                sh '''
                echo "🚀 Deploying containers..."

                docker compose down || true

                docker compose pull

                docker compose up -d --remove-orphans

                echo "📦 Running containers:"
                docker ps
                '''
            }
        }
    }

    post {
        success {
            echo "✅ CI/CD completed successfully — App deployed & auto-restart enabled"
        }
        failure {
            echo "❌ Pipeline failed — check logs above"
        }
    }
}
