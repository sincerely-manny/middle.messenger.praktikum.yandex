FROM --platform=linux/amd64 node:lts-alpine
ENV NODE_ENV=development
RUN apk add --update npm
WORKDIR /var/www
COPY ["package.json", "tsconfig.json", "webpack.config.cjs", "webpack.config.prod.cjs", ".eslintignore", ".mocharc.json", "./"]
COPY ["src", "./src"]
COPY ["static", "./static"]
RUN npm install
EXPOSE 8080
CMD npm start
