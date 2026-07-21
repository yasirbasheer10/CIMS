FROM node:20-alpine

WORKDIR /app

# Copy all source files
COPY . .

# Install dependencies and build the React frontend
RUN npm run build

# Expose the port (Back4app and other container hosts use this)
EXPOSE 5000

# Start the Node.js server
CMD ["npm", "start"]
