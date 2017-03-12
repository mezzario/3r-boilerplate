SCRIPT_DIR="$(dirname "$0")"
DEST_FOLDER="$SCRIPT_DIR/../../gh-pages"

source $SCRIPT_DIR/functions.sh

clear
message "\nUploading to Github...\n\n"

cd $DEST_FOLDER
git add -A
git commit -m "update"
printf "\n"

git push

message "\nDone.\n\n"
