#!/bin/sh
cd ${SRC_PKG}

npm install
mv index.js index.ts
npx ncc build index.ts --external rxjs --external fs -o .
# rm -rf node_modules
cp -r ${SRC_PKG} ${DEPLOY_PKG}