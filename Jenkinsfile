pipeline {
    agent { label 'new_agent' }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build') {
            steps {
                sh 'echo Build running'
            }
        }

        stage('Test') {
            steps {
                sh 'echo Test running'
            }
        }

        stage('Deploy') {
            steps {
                sh 'echo Deploy running'
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
