FROM node:20-slim

WORKDIR /app

# Copy package files first for better layer caching
COPY package.json package-lock.json* ./

# Install production dependencies only
RUN npm ci --only=production

# Create a separate layer for dev dependencies needed for build
RUN npm ci --only=development

# Copy the rest of the application code
COPY . .

# Set environment variables inside the build process
ENV DATABASE_URL=postgres://postgres:postgres@postgres:5432/threadit
ENV REDIS_SECRET=ZGIrgnku9hHWFnDbl8viQPT+eizUE7dlvVlZfZ8nJ2I=
ENV REDIS_HOST=redis
ENV REDIS_PORT=6379
ENV COOKIE_NAME=qid
ENV CORS_ORIGIN_FRONTEND=http://localhost:3000
ENV CORS_ORIGIN_BACKEND=http://localhost:4000
ENV NODE_ENV=production
ENV GOOGLE_APP_PASSWORD=iqtnvmneoffjlbdw
ENV GOOGLE_APP_HOST=amrmohamed2766@gmail.com

# Build TypeScript code
RUN npx tsc

# Run database migrations
RUN npm run db:migrate

# Remove dev dependencies
RUN npm prune --production

# Expose the port the app runs on
EXPOSE 4000

# Command to run the application using node instead of nodemon
CMD ["npm", "run", "startServer"]