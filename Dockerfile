## Stage 1: Build PRGminer and Conda environment
FROM continuumio/miniconda3:latest AS builder

# Install system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    curl \
    git \
    git-lfs \
    wget \
    build-essential \
    ca-certificates \
    gnupg \
    && rm -rf /var/lib/apt/lists/* \
    && git lfs install

RUN curl -fsSL ftp://ftp.ncbi.nlm.nih.gov/entrez/entrezdirect/install-edirect.sh | sh \
    && echo "export PATH=\$PATH:/root/edirect" >> ~/.bashrc

COPY environment.yml /tmp/environment.yml

RUN conda env create -f /tmp/environment.yml && \
    conda clean -afy && \
    echo "source activate prgminer" >> ~/.bashrc

SHELL ["conda", "run", "-n", "prgminer", "/bin/bash", "-c"]

# Install PRGminer
RUN git lfs clone https://github.com/usubioinfo/PRGminer.git /PRGminer \
    && cd /PRGminer \
    && pip install .

# Stage 2: setup Node.js and npm and build Next.js app

FROM node:18-alpine AS web-builder

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package.json ./

RUN npm install

# Copy all config files
COPY .env* ./
COPY next.config.mjs ./
COPY jsconfig.json ./
COPY postcss.config.mjs ./
COPY eslint.config.mjs ./

# Copy source code and public assets
COPY src/ ./src/
COPY public/ ./public/
COPY server.js ./

# Explicitly set NODE_ENV for the build
ENV NODE_ENV=production
ENV NEXT_PUBLIC_BASE_PATH="/prgminer"

# Build the application
RUN npm run build
RUN ls -la .next/

# Stage 3: Final image

FROM continuumio/miniconda3:latest

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    curl \
    git \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

# Copy conda environment and PRGminer from builder
COPY --from=builder /opt/conda/envs/prgminer /opt/conda/envs/prgminer
COPY --from=builder /PRGminer /PRGminer

# Create app directory
WORKDIR /app

# Copy Next.js files
COPY --from=web-builder /app/.next ./.next
COPY --from=web-builder /app/public ./public
COPY --from=web-builder /app/package*.json ./
COPY --from=web-builder /app/next.config.mjs ./
COPY --from=web-builder /app/.env* ./
COPY --from=web-builder /app/server.js ./
COPY --from=web-builder /app/node_modules ./node_modules

# Ensure Conda environment is sourced properly
SHELL ["/bin/bash", "-c"]
RUN echo "source /opt/conda/etc/profile.d/conda.sh && conda activate prgminer" >> ~/.bashrc

# Set environment variables to ensure Conda is found
ENV PATH="/opt/conda/envs/prgminer/bin:$PATH"
ENV CONDA_DEFAULT_ENV=prgminer
ENV CONDA_PREFIX=/opt/conda/envs/prgminer
ENV NODE_ENV=production
ENV NEXT_PUBLIC_BASE_PATH="/prgminer"

# Expose the port
EXPOSE 3008

# Use source instead of direct activation in CMD
CMD ["/bin/bash", "-c", "source /opt/conda/etc/profile.d/conda.sh && conda activate prgminer && npm run start"]