#!/bin/bash
set -e

git clone https://${GH_TOKEN}@github.com/willcrichton/willcrichton.github.io _site
bundle exec jekyll build

cd _site
git config user.email "wcrichto@cs.stanford.edu"
git config user.name "Will Crichton"
git add --all
git commit -a -m "Travis #$TRAVIS_BUILD_NUMBER"
git push -f
