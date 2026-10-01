FROM node:alpine
COPY . /server
WORKDIR /server
USER node
CMD ["node", "src/server.js"]