FROM node:20-slim

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --omit=dev && npm install --dev vite typescript @vitejs/plugin-react tailwindcss postcss autoprefixer vite-tsconfig-paths

COPY . .

RUN npm run build

EXPOSE 4000

CMD ["node", "api/server.js"]
