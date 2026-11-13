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

        stage('Test Backend (.NET 10)') {
            steps {
                echo '🧪 Running Backend Unit and Integration tests...'
                // Run tests inside the official .NET 10 SDK container
                sh '''
                    docker run --rm -v "$(pwd)/backend":/app -w /app mcr.microsoft.com/dotnet/sdk:10.0 \
                        dotnet test Simon.slnx -c Release
                '''
            }
        }

        stage('Test Frontend (React)') {
            steps {
                echo '🧪 Running Frontend Unit tests and TypeScript compilation...'
                // Run tests inside the official Node 20 container
                sh '''
                    docker run --rm -v "$(pwd)/client":/app -w /app node:20-alpine sh -c "
                        npm ci && \
                        npm test && \
                        npm run build
                    "
                '''
            }
        }

        stage('Build Docker Images') {
            steps {
                echo '🐳 Building production Docker images for Backend and Frontend...'
                sh 'docker-compose build'
            }
        }

        stage('Deploy Application') {
            steps {
                echo '🚀 Deploying containers via Docker Compose...'
                sh 'docker-compose down'
                sh 'docker-compose up -d'
            }
        }

        stage('Smoke Test & Health Check') {
            steps {
                echo '🩺 Verifying deployment health...'
                // Wait up to 30 seconds for the backend API to respond
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
            echo '🧹 Pipeline execution finished.'
        }
        success {
            echo '🎉 Deployment succeeded! Web App is live on http://localhost:3000'
        }
        failure {
            echo '🚨 Pipeline failed! Check the console output above.'
        }
    }
}

