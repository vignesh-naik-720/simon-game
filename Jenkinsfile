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
                echo '🚀 Deploying services...'
                sh '''
                    # 1. Clean up any existing containers or port conflicts
                    docker rm -f simon-backend simon-frontend 2>/dev/null || true
                    docker network create simon-net 2>/dev/null || true

                    # 2. Deploy using Docker Compose (or Docker Run fallback)
                    if docker-compose up -d --no-build 2>/dev/null; then
                        echo "Containers deployed via docker-compose."
                    else
                        echo "Deploying via direct Docker runtime..."
                        docker run -d \
                            --name simon-backend \
                            --network simon-net \
                            --network-alias backend \
                            --restart unless-stopped \
                            -p 5000:5000 \
                            -v simon_sqlite_data:/app/data \
                            -e ASPNETCORE_ENVIRONMENT=Development \
                            -e ConnectionStrings__DefaultConnection="Data Source=/app/data/simon.db" \
                            simon-backend:latest

                        docker run -d \
                            --name simon-frontend \
                            --network simon-net \
                            --restart unless-stopped \
                            -p 3000:3000 \
                            simon-frontend:latest
                    fi
                '''
            }
        }

        stage('Smoke Test & Health Check') {
            steps {
                echo '🩺 Verifying deployment health...'
                sh '''
                    # Connect Jenkins container to the shared Docker network for direct probing
                    docker network connect simon-net $(hostname) 2>/dev/null || true
                    docker network connect simon-game_default $(hostname) 2>/dev/null || true

                    for i in $(seq 1 15); do
                        if curl -s -f http://backend:5000/api/health || curl -s -f http://host.docker.internal:5000/api/health || curl -s -f http://localhost:5000/api/health; then
                            echo "✅ Backend API is healthy and operational!"
                            exit 0
                        fi
                        echo "Waiting for service to become ready ($i/15)..."
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
