pipeline {
    agent any

    environment {
        COMPOSE_PROJECT_NAME = 'simon-game'
    }

    stages {
        stage('Checkout Code') {
            steps {
                echo '📥 Checking out latest source code...'
                checkout scm
            }
        }

        stage('Build & Test Backend') {
            steps {
                echo '🧪 Building and packaging Backend (.NET 10 + SQLite)...'
                sh 'docker build -t simon-backend:latest -f backend/Dockerfile backend'
            }
        }

        stage('Build & Test Frontend') {
            steps {
                echo '🧪 Running tests and compiling Frontend (React + Vite)...'
                sh 'docker build -t simon-frontend:latest -f client/Dockerfile client'
            }
        }

        stage('Deploy Application') {
            steps {
                echo '🚀 Launching services via Docker Compose...'
                sh 'docker-compose down || true'
                sh 'docker-compose up -d'
            }
        }

        stage('Smoke Test & Health Check') {
            steps {
                echo '🩺 Verifying deployment health...'
                sh '''
                    for i in $(seq 1 15); do
                        if curl -s -f http://localhost:5000/api/health; then
                            echo "✅ Application is healthy!"
                            exit 0
                        fi
                        echo "Waiting for backend to start ($i/15)..."
                        sleep 2
                    done
                    echo "❌ Health check timed out!"
                    exit 1
                '''
            }
        }
    }

    post {
        always {
            echo '📋 Pipeline execution completed.'
        }
        success {
            echo '🎉 Deployment succeeded! Web App is live on http://localhost:3000'
        }
        failure {
            echo '🚨 Pipeline failed! Check the console output above.'
        }
    }
}
