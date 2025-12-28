pipeline {
  agent any
  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Build Images') {
      steps {
        script {
          // Build server
          sh 'docker build -t myapp-server:latest ./server'
          // Build frontend
          sh 'docker build -t myapp-frontend:latest ./frontend'
        }
      }
    }

    stage('Compose Up') {
      steps {
        sh 'docker-compose up -d --build'
      }
    }
  }
  post {
    always {
      sh 'docker-compose ps || true'
    }
  }
}
