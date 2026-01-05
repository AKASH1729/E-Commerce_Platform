@Library('Shared') _
pipeline {
    agent { label 'Node' }

    environment {
        SONAR_HOME = tool "Sonar"
    }

    parameters {
        string(name: 'FRONTEND_DOCKER_TAG', defaultValue: '', description: 'Frontend Docker image tag')
        string(name: 'BACKEND_DOCKER_TAG', defaultValue: '', description: 'Backend Docker image tag')
    }

    stages {

        stage("Validate Parameters") {
            steps {
                script {
                    if (params.FRONTEND_DOCKER_TAG == '' || params.BACKEND_DOCKER_TAG == '') {
                        error("FRONTEND_DOCKER_TAG and BACKEND_DOCKER_TAG must be provided.")
                    }
                }
            }
        }

        stage("Workspace Cleanup") {
            steps {
                cleanWs()
            }
        }

        stage("Git: Code Checkout") {
            steps {
                script {
                    code_checkout(
                        "https://github.com/AKASH1729/E-Commerce_Platform.git",
                        "main"
                    )
                }
            }
        }

        stage("Trivy: Filesystem Scan") {
            steps {
                script {
                    trivy_scan()
                }
            }
        }

        stage("OWASP: Dependency Check") {
            steps {
                script {
                    owasp_dependency()
                }
            }
        }

        stage("SonarQube: Code Analysis") {
            steps {
                script {
                    sonarqube_analysis(
                        "Sonar",
                        "E-Commerce_Platform",
                        "E-Commerce_Platform"
                    )
                }
            }
        }

        stage("SonarQube: Quality Gate") {
            steps {
                script {
                    sonarqube_code_quality()
                }
            }
        }

        stage("Export Environment Variables") {
            parallel {
                stage("Backend env") {
                    steps {
                        dir("Automations") {
                            sh "bash updatebackendnew.sh"
                        }
                    }
                }

                stage("Frontend env") {
                    steps {
                        dir("Automations") {
                            sh "bash updatefrontendnew.sh"
                        }
                    }
                }
            }
        }

        stage("Docker: Build Images") {
            steps {
                script {
                    dir('backend') {
                        docker_build(
                            "ecommerce-backend",
                            "${params.BACKEND_DOCKER_TAG}",
                            "akas11729"
                        )
                    }

                    dir('frontend') {
                        docker_build(
                            "ecommerce-frontend",
                            "${params.FRONTEND_DOCKER_TAG}",
                            "akas11729"
                        )
                    }
                }
            }
        }

        stage("Docker: Push Images") {
            steps {
                script {
                    docker_push("ecommerce-backend", "${params.BACKEND_DOCKER_TAG}", "akas11729")
                    docker_push("ecommerce-frontend", "${params.FRONTEND_DOCKER_TAG}", "akas11729")
                }
            }
        }
    }

    post {
        success {
            archiveArtifacts artifacts: '*.xml', followSymlinks: false

            build job: "E-Commerce-CD",
                parameters: [
                    string(name: 'FRONTEND_DOCKER_TAG', value: "${params.FRONTEND_DOCKER_TAG}"),
                    string(name: 'BACKEND_DOCKER_TAG', value: "${params.BACKEND_DOCKER_TAG}")
                ]
        }
    }
}
