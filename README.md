# PRGminer Web Portal (`prgminer_web`)

Secure Next.js web application and HPC SLURM prediction gateway for **PRGminer** (*Frontiers in Plant Science*, 2025; [DOI: 10.3389/fpls.2025.1411525](https://doi.org/10.3389/fpls.2025.1411525)).

- **Live Portal:** [https://kaabil.net/prgminer](https://kaabil.net/prgminer)
- **Standalone CLI Repository:** [https://github.com/usubioinfo/PRGminer](https://github.com/usubioinfo/PRGminer)

## Key Capabilities

- **Two-Phase R-Gene Cascade:** Phase I binary plant resistance protein screening (`Rgene` vs. `Non-Rgene`, 98.75% CV accuracy) followed by Phase II 8-class architectural classification (`CNL`, `TNL`, `RLK`, `RLP`, `LECRK`, `LYK`, `TIR`, `KIN`, 97.55% CV accuracy).
- **Interactive R-Gene Domain Architecture Studio:** Explore N-to-C terminal domain schematics (`CC`, `TIR`, `NB-ARC`, `eLRR`, `LRR`, `LECM`, `LYSM`, `TM`, `Kinase`), cellular localization, and curated plant benchmark sequences.
- **Hardened Cluster Gateway:** Async job submission (`202 Accepted`) over SSH/SFTP (`ssh2`) with ED25519 host-key pinning, Cloudflare Turnstile verification, Nginx rate limiting, and fragment-only job tokens.
- **Integrated 2D & 3D Structure Prediction:** In-container S4PRED secondary structure diagrams and interactive NGL 3D structure viewer via ESMFold / SWISS-MODEL.
- **Automated GitHub Standalone Archive:** Packages `prgminer-standalone.tar.gz` (with bundled `.tflite` weights), `SHA256SUMS`, and `REVISION.txt` directly from `usubioinfo/PRGminer`.

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3008/prgminer`.

## Production Deployment (Podman / Docker)

See [deploy/README.md](./deploy/README.md) or run `./start.sh`.
