FROM python:3.9.14-slim

# Cython requirements including installing gcc
RUN apt-get update && \
    apt-get install --no-install-recommends -y \
        apt-utils \
        build-essential && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /var/src/
# Generate an expanded requirements file
COPY api/requirements.txt api/requirements.txt
RUN pip3 install -r api/requirements.txt
COPY api api
COPY database database
EXPOSE 5000

WORKDIR /var/src/api/

ENV FLASK_APP=/var/src/api/main.py
ENV FLASK_ENV=development

CMD [ "flask", "run", "--host=0.0.0.0"]
