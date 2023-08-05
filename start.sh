#!/usr/bin/env bash

if type node > /dev/null 2>&1 && which node > /dev/null 2>&1 ;then
    node -v
    echo "nodeJs is installed, skipping..."
else
    if [[ "$OSTYPE" == "cygwin" ]]; then
        curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
        sudo apt-get install -y nodejs

        echo "NodeJs is installed"
        echo node -v
    else 
    
    echo "installing nodeJs...  please wait..."

    # Install nvm using curl
    curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.6/install.sh | bash

    # check if nvm is installed
    nvm -v

    # Install NodeJs
    nvm install v16.16.0

    # check if node is installed
    node -v

    nvm use v16.16.0

    nvm alias default v16.16.0

    # installing yarn
    curl -o- -L https://yarnpkg.com/install.sh | bash -s -- --version 1.22.19

    echo "==> Adding Yarn to environment path"
    # Yarn configurations
    export PATH="$HOME/.yarn/bin:$PATH"
    yarn config set prefix ~/.yarn -g
fi

# creating .env file on backend

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

cd $SCRIPT_DIR

echo -e "PORT=3030\nNODE_ENV=development\nJWT_SECRET='secret'" > .env

# installing dependencies
if [ -d "node_modules" ]; then
    echo "node_modules already exists... skipping..."
else
    echo "installing dependencies..."
    npm install
fi

echo "starting server..."
npm run start
