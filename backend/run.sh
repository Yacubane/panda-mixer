#!/usr/bin/env bash
cd $(dirname $0)
sudo systemctl start docker
sudo docker run -p 6379:6379 -d redis:2.8
cd mysite
pipenv run python3 manage.py runserver  