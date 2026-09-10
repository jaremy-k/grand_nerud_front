FROM node:20-alpine AS builder

WORKDIR /app

# Keep devDependencies (tsc, vite) even if the host has NODE_ENV=production.
ENV NODE_ENV=development

COPY package.json package-lock.json ./
RUN npm ci --include=dev

COPY . .

ARG VITE_API_URL
ARG VITE_COOKIE_DOMAIN
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_COOKIE_DOMAIN=$VITE_COOKIE_DOMAIN

RUN npm run build

FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
