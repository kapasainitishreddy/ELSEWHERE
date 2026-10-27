#!/usr/bin/env bash
set -euo pipefail
# Explicit developer-only installer. Run in Linux or Windows WSL2 from repo root.
# Submodule SHAs are pinned in the parent git tree: do NOT track floating main.
if ! command -v git >/dev/null || ! command -v uv >/dev/null; then
  echo "Needs git and uv. Use Linux/WSL2 with network access." >&2
  exit 2
fi
git submodule update --init -- tools/research/harness2 tools/research/rrsi
(
  cd tools/research/harness2
  uv venv --python 3.12 .venv
  uv pip install --python .venv/bin/python -e '.[render]'
  .venv/bin/harness2-demo --output runs/elsewhere-synthetic-demo --k 2
)
(
  cd tools/research/rrsi
  uv venv --python 3.12 .venv
  uv pip install --python .venv/bin/python -e '.[dev]'
  .venv/bin/python -m pytest tests
)
echo "Google upstream demos/tests installed and executed only on this developer machine."
echo "No model-backed optimization run and no production code is automatically changed."
