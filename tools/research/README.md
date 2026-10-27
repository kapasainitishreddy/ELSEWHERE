# Google Research harnesses, pinned and isolated

The parent repository records official Google Research upstreams as submodules:

* Harness2: google-research/harness2 @ 1cfe254e8d25b15f37048c3730134686abe60335 (Apache-2.0)
* RRSI: google-research/rrsi @ be50316e1db05914068a973f322770ef08ed7ba1 (Apache-2.0)

Run in Linux / Windows WSL2 with Python 3.12, uv, git, and network:

    bash tools/research/install-demo.sh

This clones BOTH pinned upstream repositories, installs their **developer-only environments**, runs Harness2's synthetic demo and RRSI's upstream tests. This does NOT run them as a reviewer of ELSEWHERE, which needs new benchmark adapters and model access. Do NOT pretend this step demonstrates source quality or hackathon readiness. Harness2's model-backed runs can disable sandbox restrictions or use unrestricted networking: execute only in disposable isolated environments with explicit model spend approval. Neither dependency ships in the browser. No Google API credentials are in this repository.

A useful, zero-credential in-repo review is available right away:

    npm run review:source
    npm run review:agents

The latter executes available local tests and Vite build if node_modules exists. Findings are written under ignored review-output; it never reads secrets. Reviewer instructions are under agents/review/. 

Other Google Research repositories such as CLASHarness and PLE are **benchmarks**, not production AI code-review agents. They were reviewed as references only, not installed.
