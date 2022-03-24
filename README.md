# IoT Device Manager API server

School bachelors project

Server for storing IoT device data.


## Before start

setup ENV:

    required:
        DATABASE_URL="file:path_to_db"

    optional:
        JWT_SECRET="some serect" // if not provide, random hash will be generated
        JWT_EXPIRES_IN="8h"
