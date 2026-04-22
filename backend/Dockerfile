FROM node:20-alpine

WORKDIR /app

# Copy dependency manifests first (better caching)
COPY package*.json ./

# Install production deps only
RUN npm ci --omit=dev

# Copy the rest of the source
COPY . .

ENV NODE_ENV=production
EXPOSE 3000

CMD ["npm", "start"]
