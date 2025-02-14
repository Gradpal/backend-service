FROM node:20.18-alpine

WORKDIR /usr/src/app

# Enable Corepack to manage Yarn versions
RUN corepack enable

# Copy package files first for better cache utilization
COPY package.json yarn.lock ./

RUN yarn install

COPY . .

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

RUN yarn run build notification-service

CMD ["yarn", "start","notification-service"]
