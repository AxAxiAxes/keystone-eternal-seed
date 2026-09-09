FROM node:20-alpine

WORKDIR /app

COPY apps/axiom-freedom/package.json ./
COPY apps/axiom-freedom/server.js ./
COPY apps/axiom-freedom/index.html ./
COPY apps/axiom-freedom/library.html ./
COPY apps/axiom-freedom/axiom_web_interface.html ./
COPY docs ./docs

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/health', r => process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

CMD ["npm", "start"]
