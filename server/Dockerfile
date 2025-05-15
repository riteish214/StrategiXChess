FROM NODE:slim

WORKDIR /app

COPY eslint.config.js,package.json,package-lock.json,tailwind.config.js,tsconfig.app.json,tsconfig.json,tsconfig.node.json,vite.config.ts .

RUN npm install

EXPOSE 5173

COPY . .

CMD [ "npm","run","dev" ]
