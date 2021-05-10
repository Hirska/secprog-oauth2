FROM node:15-alpine

WORKDIR /usr/app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy app source
COPY . .

# For typescript
RUN npm run tsc
COPY src/views ./dist/views

EXPOSE 3000
CMD node dist/index.js
