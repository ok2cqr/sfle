#!/bin/sh
# Stamps a fresh release version into js/app.js and index.html.
# Run it before every deploy - the version drives the ?v= query strings, which
# is what makes browsers pick a new build up instead of serving the cached one.
#
# SFLE has no service worker, so the stamp lives in two places: APP_VERSION in
# js/app.js (which also ends up in the ADIF export header, so it has to stay
# exactly 12 characters long) and the two asset tags in index.html, for
# js/app.js and css/style.css.
#
# Usage: tools/bump-version.sh [YYYYMMDDHHMM]

set -eu

cd "$(dirname "$0")/.."

old="$(sed -n 's/^const APP_VERSION = "\(.*\)";$/\1/p' js/app.js)"
if [ -z "$old" ]; then
    echo "cannot read the current version from js/app.js" >&2
    exit 1
fi

# Local time, matching the stamps used by earlier releases
new="${1:-$(date +%Y%m%d%H%M)}"
if [ "$old" = "$new" ]; then
    echo "version is already $new, nothing to do"
    exit 0
fi

tmp="$(mktemp)"
trap 'rm -f "$tmp"' EXIT

# sed -i is spelled differently on BSD and GNU, and this runs on both.
# Redirecting back into the original file also preserves its owner and mode.

LC_ALL=C sed "s/^const APP_VERSION = \".*\";$/const APP_VERSION = \"$new\";/" js/app.js > "$tmp"
cat "$tmp" > js/app.js

# Anchored on the asset paths rather than on the old stamp, because the two
# query strings are bumped independently during development and need not match.
LC_ALL=C sed \
    -e "s|\(/js/app\.js?v=\)[0-9]\{12\}|\1$new|g" \
    -e "s|\(/css/style\.css?v=\)[0-9]\{12\}|\1$new|g" \
    index.html > "$tmp"
cat "$tmp" > index.html

echo "$old -> $new"
grep -n "$new" js/app.js index.html
