#!/usr/bin/env bash
cd $(dirname $0)
cd mysite
if [ "$1" = "--clear" ]; then
   rm -f db.sqlite3
   rm -f migrations/*
fi
pipenv run python3 manage.py makemigrations
pipenv run python3 manage.py migrate