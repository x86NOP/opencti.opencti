FROM mcr.microsoft.com/vscode/devcontainers/base:ubuntu-22.04

# https://github.com/nvm-sh/nvm/releases
ARG NVM_VERSION

# https://nodejs.org/en/about/previous-releases
ARG NODE_VERSION

# https://github.com/docker/compose/releases
ARG DOCKER_COMPOSE_VERSION

# Set interactive shell so `RUN/CMD/ENTRYPOINT` run as same user and use .bashrc
SHELL ["/bin/bash", "--login", "-i", "-c"]

# Install Prerequisites & Utils
RUN apt-get update \
    && apt-get install -y curl build-essential git dnsutils net-tools iputils-ping netcat
    
# Install Python
RUN apt-get install -y python3 python3-pip python3-dev python-is-python3

# Install NVM and Node.js
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/${NVM_VERSION}/install.sh | bash \
    && source ~/.bashrc \
    && nvm install ${NODE_VERSION} \
    && nvm alias default ${NODE_VERSION} \
    && nvm use default

# Install Docker
RUN curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
RUN echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
RUN apt-get update \
    && apt-get install -y docker-ce

# Install Docker Compose
RUN curl -SL https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-linux-x86_64 -o /usr/bin/docker-compose \
    && chmod +x /usr/bin/docker-compose \
    && usermod -aG docker vscode
