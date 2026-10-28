#!/bin/sh
# Uso: ./set-gtm.sh GTM-ABC1234
[ -z "$1" ] && { echo "Uso: ./set-gtm.sh GTM-XXXXXXX"; exit 1; }
sed -i.bak "s/GTM-XXXXXXX/$1/g" public/vitrine.html && rm -f public/vitrine.html.bak
echo "GTM $1 aplicado (head + noscript)."
