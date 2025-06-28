# frontend/Dockerfile

# --- Build Stage ---
# Use an official Node.js image to build our React app
FROM node:18-alpine AS build

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to leverage Docker caching
COPY package*.json ./

# Install all the dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# FIX: Add execute permissions to the react-scripts command
RUN chmod +x /app/node_modules/.bin/react-scripts

# Build the React app for production
RUN npm run build

# --- Production Stage ---
# Use a lightweight Nginx image to serve the static files
FROM nginx:1.21-alpine

# Copy the built React app from the 'build' stage
COPY --from=build /app/build /usr/share/nginx/html

# Copy our custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 to the outside world
EXPOSE 80

# The command to start Nginx when the container launches
CMD ["nginx", "-g", "daemon off;"]
