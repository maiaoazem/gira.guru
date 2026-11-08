#!/bin/sh
# Bloqueia commits que contenham chaves (GitLab, GitHub, Cloudflare, genéricas).
# Instalar no clone: ln -sf ../../scripts/checar-segredos.sh .git/hooks/pre-commit
if git diff --cached -U0 | grep -E '^\+' | grep -qE 'glpat-[A-Za-z0-9._-]{10,}|gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|-----BEGIN [A-Z ]*PRIVATE KEY'; then
  echo "BLOQUEADO: este commit contém algo parecido com uma chave de acesso. Remova antes de enviar." >&2
  exit 1
fi
if git diff --cached --name-only | grep -qiE '(^|/)poly\.xml$|\.token$|\.key$|\.pem$|(^|/)\.env'; then
  echo "BLOQUEADO: arquivo de chave no commit." >&2
  exit 1
fi
exit 0
