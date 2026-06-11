#!/bin/bash
# Local build script for the blog with ABC notation support
set -e

BLOG_DIR="$HOME/Documents/blogs"
SCRIPT_DIR="$BLOG_DIR/scripts"

echo "=== Step 1: Copy content to quartz ==="
cp -f "$BLOG_DIR/quartz.config.ts" "$BLOG_DIR/quartz.layout.ts" "$BLOG_DIR/quartz/"
cp -rf "$BLOG_DIR/content/"* "$BLOG_DIR/quartz/content/"

echo "=== Step 2: Preprocess ABC notation blocks ==="
node "$SCRIPT_DIR/prepare-abc.js" "$BLOG_DIR/quartz/content"

echo "=== Step 3: Build with Quartz ==="
cd "$BLOG_DIR/quartz"
rm -rf .quartz-cache
npx quartz build --concurrency 1

echo "=== Step 4: Inject abcjs library ==="
node "$SCRIPT_DIR/inject-abcjs.js" "$BLOG_DIR/quartz/public"

echo "=== Build complete! ==="
echo "Output: $BLOG_DIR/quartz/public"
echo ""
echo "To preview locally: cd $BLOG_DIR/quartz && npx quartz build -d ../content --serve"
