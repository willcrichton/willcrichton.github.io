#!/bin/bash
set -e

npm i -g yarn
yarn install
yarn build -p
mv legacy dist
mv assets dist
pushd dist/legacy
mv images demos wedding ..
