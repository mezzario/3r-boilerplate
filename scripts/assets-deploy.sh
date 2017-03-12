#!/bin/bash

SCRIPT_DIR="$(dirname "$0")"
DEST_FOLDER="$SCRIPT_DIR/../../assets"

cd $DEST_FOLDER
git add -A
git commit -m "update"
git push
cd $SCRIPT_DIR
