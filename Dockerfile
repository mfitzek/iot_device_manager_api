FROM node:lts-slim

 
ENV DATABASE_URL "file:database.db"
# ENV JWT_SECRET "random_s3cr3Te_Her+"
# ENV JWT_EXPIRES_IN "8h"

RUN apt update
RUN apt install -y sqlite3 openssl


WORKDIR /iot_data_storage
COPY . .

RUN npm install


RUN npx prisma generate
RUN npx prisma db push


RUN npm run build

CMD [ "node", "." ]

EXPOSE 3000



