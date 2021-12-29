#!/bin/bash
set -e

npm i -g yarn
yarn install
yarn build -p
mv legacy dist
pushd dist/legacy
mv images demos wedding ..
