# Built remotely by Cloud Run / Cloud Build. Docker Desktop is not required on
# the developer machine.
FROM node:24-bookworm-slim
WORKDIR /srv/rovyniq
COPY . .
RUN npm ci --omit=dev
ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080
CMD ["npm", "start"]
