#!/bin/bash
set -e

DIST=dist/client
depot build --release
mv legacy $DIST
mv assets/* $DIST/assets/
echo "willcrichton.net" > $DIST/CNAME
pushd $DIST/legacy
mv images demos wedding ..
mv notes ../notes/
