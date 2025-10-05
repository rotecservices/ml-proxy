#!/usr/bin/env bash
set -o errexit

# Instala dependências
npm install

# Cria diretório de cache
PUPPETEER_CACHE_DIR=/opt/render/.cache/puppeteer
mkdir -p $PUPPETEER_CACHE_DIR

# Instala o Chrome
npx puppeteer browsers install chrome

# Copia cache para o local correto
if [[ ! -d $PUPPETEER_CACHE_DIR ]]; then
  echo "...Copiando cache do Puppeteer"
  cp -R /opt/render/project/src/.cache/puppeteer/chrome/ $PUPPETEER_CACHE_DIR
else
  echo "...Armazenando cache do Puppeteer"
  cp -R $PUPPETEER_CACHE_DIR /opt/render/project/src/.cache/puppeteer/chrome/
fi
