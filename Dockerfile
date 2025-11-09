FROM node:18-alpine
WORKDIR /app

# copy package files first for caching
COPY package*.json ./

# use CI for reproducible installs and show logs
RUN npm ci --only=production --no-audit --loglevel=info

# application source
COPY . .

ENV PORT=3000
EXPOSE 3000

CMD ["node", "index.js"]