# ---- Build stage ----
# syntax=docker/dockerfile:1
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm \
    NODE_OPTIONS=--max-old-space-size=512 npm install --legacy-peer-deps

COPY . .

# VITE_ENDPOINT được truyền vào lúc build (ví dụ: https://yourdomain.com)
ARG VITE_ENDPOINT
ENV VITE_ENDPOINT=$VITE_ENDPOINT

RUN npm run build

# ---- Serve stage ----
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
