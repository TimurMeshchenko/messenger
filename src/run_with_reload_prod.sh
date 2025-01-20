#!/bin/bash

uvicorn main:app --port 8003 --ssl-keyfile /etc/letsencrypt/live/meshchenko.ru/privkey.pem --ssl-certfile /etc/letsencrypt/live/meshchenko.ru/fullchain.pem