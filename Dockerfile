FROM calciumion/new-api:latest AS backend-base

FROM node:20-alpine
WORKDIR /app

# Copy new-api binary from official docker image
COPY --from=backend-base /one-api /app/new-api

# Copy app files
COPY package.json ./
COPY index.js ./
COPY dist ./dist

EXPOSE 3000
ENV PORT=3000
CMD ["node", "index.js"]