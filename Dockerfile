# Install dependencies
FROM node:17-slim as deps

WORKDIR /cereza-server
COPY package.json package-lock.json ./

RUN npm install

# Build source code
FROM node:17-slim as builder

WORKDIR /cereza-server
COPY . .
COPY --from=deps /cereza-server/node_modules ./node_modules

RUN npm run build

# Generate production image
FROM node:17-slim as runner

WORKDIR /cereza-server
COPY --from=builder /cereza-server/node_modules ./node_modules
COPY --from=builder /cereza-server/build ./build
COPY --from=builder /cereza-server/package.json ./package.json

ENV PORT 5000

EXPOSE $PORT
CMD node build/index.js $PORT
