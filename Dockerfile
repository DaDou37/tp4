FROM node:alpine
COPY . /server
WORKDIR /server
CMD ["node","src/server.js"]
