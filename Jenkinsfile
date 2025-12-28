pipeline {
    agent { label 'new_agent' }

    environment {
        GIT_CREDS = 'github-token'
        DOCKER_CREDS = 'dockerhub'

        SERVER_IMAGE = 'arya51090/myapp-server'
        FRONTEND_IMAGE = 'arya51090/myapp-frontend'
    }

    stages {

        stage('Checkout Code') {
            steps {
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: '*/main']],
                    userRemoteConfigs: [[
                        url: 'https://github.com/sahuaryan254-wq/cloud-storage-.git',
                        credentialsId: GIT_CREDS
                    ]]
                ])
            }
        }

        stage('Build Docker Images') {
            steps {
                script {
                    sh "docker build -t $SERVER_IMAGE:latest ./server"
                    sh "docker build -t $FRONTEND_IMAGE:latest ./frontend"
                }
            }
        }

        stage('Docker Login') {
            steps {
                script {
                    docker.withRegistry('', DOCKER_CREDS) {
                        echo "DockerHub login successful"
                    }
                }
            }
        }

        stage('Push Images to DockerHub') {
            steps {
                script {
                    docker.withRegistry('', DOCKER_CREDS) {
                        sh "docker push $SERVER_IMAGE:latest"
                        sh "docker push $FRONTEND_IMAGE:latest"
                    }
                }
            }
        }

        stage('Deploy using Docker Compose') {
            steps {
                sh 'docker-compose up -d --build'
            }
        }
    }

    post {
        always {
            sh 'docker ps'
        }
    }
}
