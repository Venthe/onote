#!/usr/bin/env bash

set -e
set -x

# npm run prettier -- . --list-different 2>/dev/null | xargs -I{} bash -c "mkdir tmp -p && rsync -azR {} ./tmp && npm run prettier -- ./tmp/{} --write && diff --color -u {} ./tmp/{}"
npm run prettier -- . --list-different 2>/dev/null
