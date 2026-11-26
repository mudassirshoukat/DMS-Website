#!/bin/sh
# Writes the app's address for the website's Sign in links when the container starts.
# Set VITE_DMS_PORTAL_URL per deployment, for example https://app-stage.doxyle.com
# (the page adds /login). When it is not set, the links go nowhere rather than to the
# wrong environment's app.
set -eu
# Quotes, backslashes and angle brackets are dropped so the value stays plain text.
url=$(printf '%s' "${VITE_DMS_PORTAL_URL:-}" | tr -d "\"'\\\\<>")
printf "window.DOXYLE_PORTAL_URL = '%s';\n" "$url" > /usr/share/nginx/html/portal-config.js
