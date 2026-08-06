# 로컬 개발용 (핫리로드). 배포 시에는 build 후 nginx 이미지로 정적 서빙.
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
