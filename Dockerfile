FROM node:10.15.3

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install

RUN npm rebuild bcrypt --build-from-source

RUN rm -rf node_modules/
RUN  npm update
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .


EXPOSE 5000

CMD [ "npm", "start" ]