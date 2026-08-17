# Builds the CRA frontend and serves it (plus /api/*) from the Express server.
FROM node:20-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN GENERATE_SOURCEMAP=false npm run build

# Set only after the build: devDependencies (tailwind etc.) are needed above.
ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

CMD ["node", "server/server.js"]
