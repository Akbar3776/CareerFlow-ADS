# frontend/Dockerfile
# Stage 1: Build the React app
FROM node:20-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# If using Vite, this creates the /dist folder. (Use 'npm run build' for CRA which makes /build)
RUN npm run build 

# Stage 2: Serve the app with Nginx
FROM nginx:alpine
# Copy the build output to replace the default Nginx contents
COPY --from=build /app/dist /usr/share/nginx/html

# Add a custom Nginx config to handle React Router (prevents 404 on refresh)
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]