#!/usr/bin/env bash
# Builds installable zips for WordPress admin → Plugins/Themes → Add New → Upload.
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p dist
rm -f dist/shilperhaat.zip dist/shilperhaat-cms.zip
( cd wp-content/themes  && zip -qr ../../dist/shilperhaat.zip shilperhaat )
( cd wp-content/plugins && zip -qr ../../dist/shilperhaat-cms.zip shilperhaat-cms )
ls -la dist
