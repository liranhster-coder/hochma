FROM node:22.14.0-alpine
RUN apk add --no-cache openssl
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npx next build
ENV HOSTNAME="0.0.0.0"
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && npx next start -p ${PORT:-3000}"]
