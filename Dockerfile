# syntax=docker/dockerfile:1

FROM node:20

COPY --chown=0:0 . /app

WORKDIR /app
RUN npm clean-install --omit=dev

ENTRYPOINT [ "node" ]
CMD [ "/app" ]
