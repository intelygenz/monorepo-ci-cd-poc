#!/bin/sh

FILTER_PATH=$1
TAG=$2
shift 2

if [ ! -d "${REPO_PATH}" ]; then
 echo "::warning :: folder ${REPO_PATH} must be present to run this action."
 exit 0
fi

cd $REPO_PATH

echo "::info ::git-chglog executing command: /bin/git-chglog --path $FILTER_PATH $TAG $@"
CHANGELOG=$(git-chglog --path $FILTER_PATH $TAG $@)

echo "----------------------------------------------------------"
echo "${CHANGELOG}"
echo "----------------------------------------------------------"

CHANGELOG="${CHANGELOG//'%'/'%25'}"
CHANGELOG="${CHANGELOG//$'\n'/'%0A'}"
CHANGELOG="${CHANGELOG//$'\r'/'%0D'}"

echo "::set-output name=changelog::${CHANGELOG}"
