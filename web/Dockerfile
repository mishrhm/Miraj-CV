FROM node:20-slim

# Prisma's query engine binary is linked against OpenSSL. node:20-slim is a
# minimal Debian image that doesn't include it, so Prisma fails at runtime
# with "libssl.so.1.1: cannot open shared object file" without this.
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .

RUN npx prisma generate

EXPOSE 3000

CMD ["npm", "run", "dev"]
