FROM node:16.13.1-alpine3.13 AS build

ARG APP_NAME
ARG DEV_DEPS
ARG INSTALL_BUILD_PKGS
ENV IS_DOCKER_BUILD true

# Create app directory
WORKDIR /usr/src/app

# Copy project
COPY . .

# delete unneeded projects
RUN node scripts/docker/delete-redundant-projects.js --appName ${APP_NAME};

RUN echo "INSTALL_BUILD_PKGS (custom build dependencies): $INSTALL_BUILD_PKGS"

# install build dependecies
RUN if [[ ! -z "$INSTALL_BUILD_PKGS" ]]; \
    then \
      apk --no-cache add python3 make g++ ${INSTALL_BUILD_PKGS}; \
    else \
      apk --no-cache add python3 make g++; \
    fi

# install Node.js dependecies
RUN yarn install --prod

# Delete .npmrc. It is needed for npm install, but contains private key to NPM repository and we don't want to leave that in a docker image.
RUN rm .npmrc

# Copy build into "app" image
FROM node:16.13.1-alpine3.13

# Instal dumb-init - used to prevent node process as PID1 (signal delegation)
RUN apk --no-cache add dumb-init

# Install curl and net-tools
RUN apk --no-cache add curl
RUN apk --no-cache add net-tools

# Set production environment (enhances some of the libraries, e.g. express)
ENV NODE_ENV production

# Refresh args, add relevant arguments to process.env
ARG GIT_COMMIT
ENV GIT_COMMIT $GIT_COMMIT
ARG GIT_BRANCH
ENV GIT_BRANCH $GIT_BRANCH
ARG BUILD_NUM
ENV BUILD_NUM $BUILD_NUM
ARG BUILD_AUTHOR
ENV BUILD_AUTHOR $BUILD_AUTHOR
ENV TZ Europe/Prague
ARG RELATIVE_APP_WORKDIR
ARG INSTALL_PKGS

# Set workdir
#RUN mkdir --parents /usr/src/app
WORKDIR /usr/src/app
#RUN chown node:node $(pwd)

# Copy app's mandatory files
COPY --chown=node:node --from=build /usr/src/app/package.json package.json
COPY --chown=node:node --from=build /usr/src/app/node_modules node_modules/
COPY --chown=node:node --from=build /usr/src/app/apps apps/
COPY --chown=node:node --from=build /usr/src/app/libs libs/

RUN if [[ ! -z "$INSTALL_PKGS" ]]; \
    then \
      apk --no-cache add ${INSTALL_PKGS}; \
    fi

# Expose port
EXPOSE 8080

# Drop linux privileges
USER node

# Set application's workdir
WORKDIR ${RELATIVE_APP_WORKDIR}

# Start the app
CMD ["dumb-init", "node", "--unhandled-rejections=warn", "--enable-source-maps", "dist/index.js"]