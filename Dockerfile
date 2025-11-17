# Multi-stage build for SKRUPULUS MIPS Simulator

# Stage 1: Build the application
FROM node:20-alpine AS builder

# Install Quasar CLI globally
RUN npm config set strict-ssl false && npm install -g @quasar/cli

# Set working directory
WORKDIR /app

# Copy the entire application
COPY bp-mips/ ./

# Install dependencies
RUN npm ci

# Build the application for production
RUN quasar build -m pwa

# Stage 2: Serve with nginx
FROM nginx:alpine

# Install apache2-utils for htpasswd
RUN apk add --no-cache apache2-utils

# Copy nginx configuration
COPY bp-mips/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built application from builder stage
COPY --from=builder /app/dist/pwa /usr/share/nginx/html

# Create htpasswd file with default credentials
# Username: fiit, Password: mips2024
# This should be changed in production by mounting a custom .htpasswd file
RUN htpasswd -bc /etc/nginx/.htpasswd fiit mips2024

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
