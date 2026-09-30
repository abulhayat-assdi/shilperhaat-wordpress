#!/bin/sh
set -e
# Fix permissions on the uploads volume mount so nextjs user can write
mkdir -p /app/public/uploads
chown -R nextjs:nodejs /app/public/uploads
exec su-exec nextjs "$@"
