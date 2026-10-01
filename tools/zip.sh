#!/usr/bin/env bash
# Builds the installable archives into releases/ (theme + plugin) and dist/ (media, too large to keep in git twice).
#   releases/shilperhaat-theme.zip   -> WordPress: Appearance > Themes > Add New > Upload
#   releases/shilperhaat-cms.zip     -> WordPress: Plugins > Add New > Upload
#   dist/shilperhaat-uploads.zip     -> extract into wp-content/uploads/shilperhaat/ (products, banners, categories, brand, site, videos)
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p releases dist
rm -f releases/shilperhaat-theme.zip releases/shilperhaat-cms.zip dist/shilperhaat-uploads.zip
( cd wp-content/themes && zip -qr ../../releases/shilperhaat-theme.zip shilperhaat -x '*.DS_Store' )
( cd wp-content/plugins && zip -qr ../../releases/shilperhaat-cms.zip shilperhaat-cms -x '*.DS_Store' )
( cd assets/uploads && zip -qr ../../dist/shilperhaat-uploads.zip . -x 'blog/*' -x '*.DS_Store' )
ls -lh releases dist
