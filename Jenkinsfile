pipeline {
    agent any

    stages {
        stage('Test Agent') {
            steps {
                sh '''
                echo "Agent working"
                whoami
                pwd
                '''
            }
        }
    }
}
