# Multi-stage build for Angular Microfrontends
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build all microfrontends in correct order
RUN npm run build:all

# Production stage with Nginx
FROM nginx:alpine AS production

# Copy custom nginx configuration
COPY docker/nginx.conf /etc/nginx/nginx.conf

# Copy built applications
COPY --from=build /app/dist/shared /usr/share/nginx/html/shared
COPY --from=build /app/dist/products /usr/share/nginx/html/products  
COPY --from=build /app/dist/shell /usr/share/nginx/html

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]