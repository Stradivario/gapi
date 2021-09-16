#!/bin/sh
cd ${SRC_PKG}

npm install

npx ncc build ./src/index.ts --external rxjs --external fs -o .
# rm -rf node_modules
cp -r ${SRC_PKG} ${DEPLOY_PKG}