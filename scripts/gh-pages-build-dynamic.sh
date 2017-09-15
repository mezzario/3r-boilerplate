SCRIPT_DIR="$(dirname "$0")"
SRC_FOLDER="$SCRIPT_DIR/../src/build/public"
SRC_INDEX_FILE="$SRC_FOLDER/index.html"
DEST_FOLDER="$SCRIPT_DIR/../../gh-pages"

source $SCRIPT_DIR/functions.sh

if [ ! -f $SRC_INDEX_FILE ];
then
    error "\nFile '$SRC_INDEX_FILE' not found.\n\n"
    exit 1
fi

clear
message "\nRemoving files...\n\n"

find $DEST_FOLDER/* ! -name .git -type d -exec rm -rfv {} +
rm -fv $DEST_FOLDER/* $DEST_FOLDER/.*

message "\nCopying files...\n\n"

rsync -av --exclude="*.map" $SRC_FOLDER/* $DEST_FOLDER

message "\nDone.\n\n"
