#!/bin/bash

# Fetch the current branch name
BRANCH_NAME=$(git rev-parse --abbrev-ref HEAD)

# Define store URLs for each branch
case "$BRANCH_NAME" in
    ch-prod | ch-dev | master-prod | master-dev)
        URL="https://ofinto.ch"
        ;;
    de-prod | de-dev)
        URL="https://ofinto.de"
        ;;
    at-prod | at-dev)
        URL="https://ofinto.at"
        ;;
    fr-prod | fr-dev)
        URL="https://ofinto.fr"
        ;;
    uk-prod | uk-dev)
        URL="https://ofinto.co.uk"
        ;;
    *)
        echo "No specific URL set for this branch. Using CH."
        URL="https://ofinto.ch"
        ;;
esac

# Update config.stencil.json file if URL is set
if [ -n "$URL" ]; then
    cat > config.stencil.json <<EOL
{
  "customLayouts": {
    "brand": {},
    "category": {},
    "page": {},
    "product": {}
  },
  "normalStoreUrl": "$URL",
  "port": 3000,
  "apiHost": "https://api.bigcommerce.com"
}
EOL
    echo "Store URL set for branch $BRANCH_NAME in config.stencil.json"
else
    echo "No changes made to config.stencil.json"
fi