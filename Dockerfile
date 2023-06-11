FROM node:19

# Create app directory
WORKDIR /app
# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package.json .
# RUN npm install -g npm@9.7.1
RUN npm i

# Bundle app source
COPY . .

VOLUME [ "/app/node_modules" ]
EXPOSE 3000

CMD [ "npm", "run", "dev" ]
