#!/usr/bin/env bash
sudo systemctl start docker
sudo docker run -p 6379:6379 -d redis:2.8
python3 mysite/manage.py runserver