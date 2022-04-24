FROM node:lts

 
ENV DATABASE_URL "file:database.db"
# ENV JWT_SECRET "random_s3cr3Te_Her+"
# ENV JWT_EXPIRES_IN "8h"

RUN apt update
RUN apt install sqlite3


WORKDIR /iot_data_storage
COPY . .

RUN npm install

RUN npx prisma migrate deploy

RUN npm run build

CMD [ "node", "." ]

EXPOSE 3000



