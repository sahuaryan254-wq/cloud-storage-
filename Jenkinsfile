pipeline {
    agent { label 'new_agent' }

    environment {
        GIT_CREDS = 'github-token'

        DOCKER_USERNAME = credentials('dockerhub-username')
        DOCKER_PASSWORD = credentials('dockerhub-password')

        SERVER_IMAGE   = 'arya51090/myapp-server'
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

        stage('Push Images to DockerHub') {
            steps {
                sh '''
                docker push $SERVER_IMAGE:latest
                docker push $FRONTEND_IMAGE:latest
                '''
            }
        }

        stage('Deploy (LIVE on Local Server)') {
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
        always {
            script {
                sh 'docker ps'
            }
        }
    }
}
