#!/usr/bin/env bash

# creating .env file on backend
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

echo -e "PORT=3030\nNODE_ENV=development\nJWT_SECRET='secret'" > .env

# installing dependencies
if [ -d "node_modules" ]; then
    echo "node_modules already exists... skipping..."
else
    echo "installing dependencies for backend... please wait..."
    npm install
fi

