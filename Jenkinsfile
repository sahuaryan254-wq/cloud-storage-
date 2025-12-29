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
                sh '''
                echo "Build running"
                '''
            }
        }

        stage('Test') {
            steps {
                sh '''
                echo "Test running"
                '''
            }
        }

        stage('Deploy') {
            steps {
                sh '''
                echo "Deploy running"
                '''
            }
        }
    }

    post {
        always {
            echo "Pipeline finished"
        }
    }
}
