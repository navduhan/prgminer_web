# PRGminer Web Deployment Guide

This deployment runs `prgminer_web` as a hardened two-container stack (`prgminer-web` Next.js standalone server + `prgminer-gateway` unprivileged Nginx rate-limiting reverse proxy) on TCP port `3008` under `/prgminer`.

## Architecture Overview

1. **HPC SLURM Prediction Gateway:** Submitted FASTA jobs are validated, Turnstile-verified, uploaded over SFTP (`0600`) to the biocluster, and executed via `sbatch --parsable --wait` using `run_prgminer_web.slurm` (`ml-gpu` module).
2. **Private Tokenized Results:** Each submission returns a random 256-bit bearer token stored only in the URL `#` fragment (`#job=...&token=...`), retained for 30 days (`PREDICTION_JOB_RETENTION_MS=2592000000`).
3. **2D & 3D Structure Prediction:** S4PRED runs locally inside `/opt/s4pred-venv` for fast secondary structure; tertiary 3D structures use ESMFold (`<= 400` aa) and SWISS-MODEL (`> 400` aa when `SWISS_MODEL_TOKEN` is configured).
4. **Automated GitHub Standalone Packaging:** `deploy/package-standalone.sh` resolves the latest commit of `usubioinfo/PRGminer` via `git ls-remote`, downloads the `codeload.github.com` tarball (including bundled `.keras` and `.tflite` weights), and publishes `prgminer-standalone.tar.gz`, `SHA256SUMS`, and `REVISION.txt` under `/prgminer/download/`.

## Quick Start (`./start.sh`)

```bash
./start.sh --setup
```

Non-interactive management modes:

```bash
./start.sh --configure-only
./start.sh --start-only
./start.sh --update
./start.sh --rebuild
```

### Rootless Podman (RHEL-family VMs)

```bash
podman compose --env-file deploy/docker.env \
  -f deploy/compose.yaml \
  -f deploy/compose.podman.yaml \
  up -d --build
```

### Docker Engine

```bash
docker compose --env-file deploy/docker.env \
  -f deploy/compose.yaml \
  -f deploy/compose.ssh-key.yaml \
  up -d --build
```

### Apache HTTPS Reverse Proxy

```apache
ProxyRequests Off
ProxyPreserveHost On
RequestHeader set X-Forwarded-Proto "https"
RequestHeader set X-Forwarded-Port "443"

ProxyPass        /prgminer http://PRGMINER_PRIVATE_HOST:3008/prgminer connectiontimeout=5 timeout=720
ProxyPassReverse /prgminer http://PRGMINER_PRIVATE_HOST:3008/prgminer
```

### Periodic Job Pruning (Crontab)

```cron
23 3 * * * /absolute/path/to/prgminer_web/deploy/prune-expired-jobs.sh
```
