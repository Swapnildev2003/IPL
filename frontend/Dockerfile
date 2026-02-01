# ===========================================
# Stage 1: Build the React application
# ===========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build argument for API URL
ARG VITE_API_URL=https://ipl-backend-demg.onrender.com/api
ENV VITE_API_URL=$VITE_API_URL

# Build the application
RUN npm run build

# ===========================================
# Stage 2: Serve with lightweight Node server
# ===========================================
FROM node:20-alpine AS production

WORKDIR /app

# Install serve globally
RUN npm install -g serve

# Copy built assets from builder
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Start server (serve handles SPA routing with -s flag)
CMD ["serve", "-s", "dist", "-l", "3000"]
