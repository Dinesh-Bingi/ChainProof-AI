FROM node:22-alpine AS base
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY src ./src
RUN mkdir -p uploads generated
ENV NODE_ENV=production
EXPOSE 5000
CMD ["node", "src/index.js"]
