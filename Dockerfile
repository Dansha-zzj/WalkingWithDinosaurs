FROM node:18.10.0

# ENV NODE_ENV=production

RUN apt-get update -y && \
    apt-get upgrade -y && \
    apt-get install -y --no-install-recommends \
        apt-utils \
        libgtk2.0-0 \
        libgtk-3-0 \
        libgbm-dev \
        libnotify-dev \
        libgconf-2-4 \
        libnss3 \
        libxss1 \
        libasound2 \
        libxtst6 \
        xauth \
        xvfb && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /var/src/
COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 8080

VOLUME [ "/var/src/" ]

CMD ["npm", "run", "dev"]

# CMD ["tail", "-f",  "/dev/null"]
