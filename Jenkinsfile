pipeline {
    agent { label 'new_agent' }

    environment {
        DOCKER_USERNAME = credentials('dockerhub-username')
        DOCKER_PASSWORD = credentials('dockerhub-password')

        SERVER_IMAGE   = 'arya51090/myapp-server'
        FRONTEND_IMAGE = 'arya51090/myapp-frontend'
    }

    stages {

        stage('Checkout Code') {
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
