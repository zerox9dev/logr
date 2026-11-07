#!/bin/sh
set -eu
mkdir -p /pb/pb_data
chown pocketbase:pocketbase /pb/pb_data
export PB_ENCRYPTION_KEY="$(printf '%.32s' "$PB_ENCRYPTION_SEED")"
if [ ! -e /pb/pb_data/.openship-superuser ]; then
  su-exec pocketbase /pb/pocketbase superuser upsert "$POCKETBASE_SUPERUSER_EMAIL" "$POCKETBASE_SUPERUSER_PASSWORD" --dir=/pb/pb_data --encryptionEnv=PB_ENCRYPTION_KEY >/dev/null
  su-exec pocketbase touch /pb/pb_data/.openship-superuser
fi
exec su-exec pocketbase "$@"
