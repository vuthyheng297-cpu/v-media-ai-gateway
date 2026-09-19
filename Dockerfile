FROM calciumion/new-api:latest

# Install nodejs
RUN apt-get update && apt-get install -y --no-install-recommends nodejs && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package.json ./
COPY index.js ./
COPY dist ./dist

EXPOSE 3000
ENV PORT=3000
CMD ["node", "index.js"]