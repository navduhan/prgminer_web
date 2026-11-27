#!/usr/bin/env bash
set -euo pipefail

destination="${1:-/opt/prgminer-downloads}"
requested_ref="${2:-${PRGMINER_STANDALONE_REF:-main}}"
repo_slug="${PRGMINER_REPO_SLUG:-usubioinfo/PRGminer}"
repo_git_url="https://github.com/${repo_slug}.git"

resolve_ref() {
    local ref="$1" sha="" candidate=""
    if [[ "$ref" =~ ^[0-9a-f]{40}$ ]]; then
        printf '%s\n' "$ref"
        return 0
    fi
    for candidate in "refs/heads/${ref}" "refs/tags/${ref}^{}" "refs/tags/${ref}" "${ref}"; do
        sha="$(git ls-remote "$repo_git_url" "$candidate" | awk 'NR==1 {print $1}')"
        if [[ "$sha" =~ ^[0-9a-f]{40}$ ]]; then
            printf '%s\n' "$sha"
            return 0
        fi
    done
    return 1
}

revision="$(resolve_ref "$requested_ref" || true)"
if [[ ! "$revision" =~ ^[0-9a-f]{40}$ ]]; then
    printf 'Failed to resolve GitHub ref "%s" from %s\n' "$requested_ref" "$repo_git_url" >&2
    exit 1
fi

work="$(mktemp -d)"
trap 'rm -rf -- "$work"' EXIT

mkdir -p "$work/extract" "$destination"
printf 'Packaging %s @ %s ...\n' "$repo_slug" "$revision"
curl --fail --silent --show-error --location --retry 3 --retry-delay 2 \
    "https://codeload.github.com/${repo_slug}/tar.gz/${revision}" \
    -o "$work/source.tar.gz"

tar -xzf "$work/source.tar.gz" -C "$work/extract"
extracted_dir="$(find "$work/extract" -mindepth 1 -maxdepth 1 -type d | head -n 1)"
if [[ -z "$extracted_dir" || ! -f "$extracted_dir/pyproject.toml" || ! -f "$extracted_dir/PRGminer/__main__.py" ]]; then
    printf 'Downloaded archive for %s did not contain a valid PRGminer source tree.\n' "$revision" >&2
    exit 1
fi

for model_file in \
    PRGminer/models/prgminer_phase1.keras \
    PRGminer/models/prgminer_phase2.keras \
    PRGminer/models/prgminer_phase1.tflite \
    PRGminer/models/prgminer_phase2.tflite; do
    if [[ ! -s "$extracted_dir/$model_file" ]]; then
        printf 'Missing bundled model artifact in source archive: %s\n' "$model_file" >&2
        exit 1
    fi
done

mv "$extracted_dir" "$work/PRGminer"
tar -czf "$destination/prgminer-standalone.tar.gz" -C "$work" PRGminer
printf '%s\n' "$revision" > "$destination/REVISION.txt"
(
    cd "$destination"
    if command -v sha256sum >/dev/null 2>&1; then
        sha256sum prgminer-standalone.tar.gz > SHA256SUMS
    else
        shasum -a 256 prgminer-standalone.tar.gz > SHA256SUMS
    fi
)
