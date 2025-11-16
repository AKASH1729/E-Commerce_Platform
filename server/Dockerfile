# ---------- STAGE 1: BUILD ----------
FROM node:18-alpine AS builder
WORKDIR /app

# Copy package.json first for caching
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy the rest of the backend files
COPY . .

# ---------- STAGE 2: RUNTIME ----------
FROM node:18-alpine
WORKDIR /app

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy built app from builder
COPY --from=builder /app /app

# Fix permissions for non-root user
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Environment
ENV NODE_ENV=production

# Expose backend port
EXPOSE 4000

# Start the backend using npm
CMD ["npm", "start"]
