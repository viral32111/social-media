# syntax=docker/dockerfile:1

FROM node:20

COPY --chown=0:0 . /app

WORKDIR /app

RUN npm clean-install --omit=dev

ENV NODE_ENV=production \
	EXPRESS_LISTEN_ADDRESS=0.0.0.0 \
	EXPRESS_LISTEN_PORT=3000 \
	EXPRESS_CLIENT_DIRECTORY=/app/client/dist \
	PACKAGE_FILE=/app/server/package.json

EXPOSE 3000/tcp

ENTRYPOINT [ "node" ]
CMD [ "/app/server" ]
