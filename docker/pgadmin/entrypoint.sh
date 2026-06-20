#!/bin/sh
# pgpass must be mode 600 for libpq; bind mounts cannot set that on the host.
set -e

setup_pgpass() {
  dest="$1"
  mkdir -p "$(dirname "$dest")"
  cp /pgadmin4/pgpass "$dest"
  chmod 600 "$dest"
  chown pgadmin:root "$dest" 2>/dev/null || chown 5050:0 "$dest"
}

if [ -f /pgadmin4/pgpass ]; then
  setup_pgpass /var/lib/pgadmin/pgpass
  setup_pgpass /var/lib/pgadmin/storage/pgadmin4_pgadmin.org/.pgpass
fi

exec /entrypoint.sh "$@"
