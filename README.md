# IoT Device Manager API server

School bachelors project

Server for storing IoT device data.

## Installation

There are two ways of installlation

Via docker
Manual installation


## Docker installation



## Manual installation

Before installation you need to install some tools

### Prerequisites
1. install [node.js](https://nodejs.org/en/download/) LTS version (16.14) with NPM
2. install [sqlite3 tools](https://www.sqlite.org/download.html) and add to system PATH
3. install openssl


### Set environment variables

    required variables:
        DATABASE_URL="file:path_to_db"

    optional variables:
        JWT_SECRET="some serect"
        JWT_EXPIRES_IN="8h"

### Installation

    npm run create_db
    npm run build

### Run the server

    node .