#!/bin/bash

set -e

git config --global user.email "travis@browser.html"
git config --global user.name "travis"

REMOTE_MASTER_HEAD=`git ls-remote origin master | cut -f 1 -d$'\t'`
REPO_URL=`git config --get remote.origin.url`
HEAD=`git rev-parse HEAD`
LATEST_TAG=`git describe --abbrev=0 --tags`
REV_FOR_LATEST_TAG=`git rev-parse $LATEST_TAG`


function deploy {

  BRANCH=${1}
  REV=${2}
  NAME=${3}

  echo "Deploying ${NAME} into branch \"${BRANCH}\""

  DEPLOYED_REV=`curl --silent https://raw.githubusercontent.com/browserhtml/browserhtml/${BRANCH}/HEAD`

  if [ "$REV" == "$DEPLOYED_REV" ]; then
    echo "${NAME} is already deployed into branch \"${BRANCH}\", skipping deployment."
    return
  fi

  rm -rf dist
  mkdir dist
  git clone -b ${BRANCH} ${REPO_URL} dist
  rm -r dist/*
  npm run build
  npm run build-cargo
  cd dist
  echo ${REV} > HEAD
  echo "" > .nojekyll
  git add -A
  git commit -m "Deploy ${NAME}"
  git push --quiet "https://travis:${GH_TOKEN}@${GH_REF}" $BRANCH > /dev/null 2>&1
  git status
  echo "Deployed ${NAME} into branch \"${BRANCH}\""

}

if [ "$HEAD" = "$REMOTE_MASTER_HEAD" ]; then
  # HEAD of master
  deploy "crate" $HEAD $HEAD
fi

if [ "$HEAD" = "$REV_FOR_LATEST_TAG" ]; then
  # Tagged commit
  deploy "gh-pages" $HEAD $LATEST_TAG
fi
