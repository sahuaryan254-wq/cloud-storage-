pipeline {
  agent any
  environment {
    IMAGE = "myregistry/myapp-frontend:${env.BUILD_NUMBER}"
  }
  stages {
    stage('Checkout') { steps { checkout scm } }
    stage('Install & Build') {
      steps {
        dir('frontend') {
          sh 'npm ci'
          sh 'npm run build'
        }
      }
    }
    stage('Build Docker Image') {
      steps {
        sh "docker build -t ${IMAGE} -f frontend/Dockerfile frontend/"
      }
    }
    stage('Push Image (optional)') {
      when { expression { return env.DOCKER_PUSH == 'true' } }
      steps {
        withCredentials([usernamePassword(credentialsId: 'docker-registry-creds', usernameVariable: 'REG_USER', passwordVariable: 'REG_PWD')]) {
          sh 'echo $REG_PWD | docker login -u $REG_USER --password-stdin myregistry'
          sh "docker push ${IMAGE}"
        }
      }
    }
    stage('Deploy with Compose') {
      steps {
        sh 'docker-compose -f docker-compose.yml up -d --build'
      }
    }
  }
  post {
    always {
      sh 'docker-compose ps || true'
    }
  }
}
