FROM NODE:slim

WORKDIR /app

COPY eslint.config.js package.json package-lock.json tailwind.config.js tsconfig.app.json tsconfig.json tsconfig.node.json vite.config.ts ./


RUN npm install

EXPOSE 3001

COPY . .

CMD [ "node","server/index.js" ]
