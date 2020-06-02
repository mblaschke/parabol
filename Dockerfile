FROM node:13.14-buster

WORKDIR /app
COPY ./ /app
RUN chmod +x /app/startup.sh
RUN yarn
RUN yarn build
CMD ["/app/startup.sh"]
