pipeline {
    agent { label 'new_agent' }

    stages {
        stage('Check Executor') {
            steps {
                sh '''
                echo "Agent OK"
                hostname
                whoami
                '''
            }
        }
    }
}
