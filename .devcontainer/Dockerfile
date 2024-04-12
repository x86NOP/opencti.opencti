FROM mcr.microsoft.com/vscode/devcontainers/base:ubuntu-22.04

# https://github.com/nvm-sh/nvm/releases
ARG NVM_VERSION=v0.39.7

# https://nodejs.org/en/about/previous-releases
ARG NODE_VERSION=20

# https://github.com/docker/compose/releases
ARG DOCKER_COMPOSE_VERSION=v2.26.1

# Set debconf to run non-interactively
RUN echo 'debconf debconf/frontend select Noninteractive' | debconf-set-selections

# Install Prerequisites & Utils
RUN apt-get update \
    && apt-get install -y curl build-essential git dnsutils net-tools iputils-ping netcat
    
# Install Python
RUN apt-get install -y python3 python3-pip python3-dev python-is-python3

# Install NVM and Node.js
RUN curl -sSo- https://raw.githubusercontent.com/nvm-sh/nvm/${NVM_VERSION}/install.sh | bash \
    && export NVM_DIR="$HOME/.nvm" \
    && [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" \
    && [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion" \
    && nvm install ${NODE_VERSION} \
    && nvm alias default ${NODE_VERSION} \
    && nvm use default

# Install Docker
RUN curl -sSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
RUN echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
RUN apt-get update \
    && apt-get install -y docker-ce

# Install Docker Compose
RUN curl -sSL https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-linux-x86_64 -o /usr/bin/docker-compose \
    && chmod +x /usr/bin/docker-compose \
    && usermod -aG docker vscode
