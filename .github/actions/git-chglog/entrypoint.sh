#!/bin/sh

if [ ! -d "${REPO_PATH}" ]; then
 echo "::warning :: folder ${REPO_PATH} must be present to run this action."
 exit 0
fi

cd $REPO_PATH

echo "::info ::git-chglog executing command: /bin/git-chglog $@"
CHANGELOG=$(git-chglog "$@")

echo "----------------------------------------------------------"
echo "${CHANGELOG}"
echo "----------------------------------------------------------"

echo "::set-output name=changelog::$( echo "${CHANGELOG}" | jq -sRr @uri )"
