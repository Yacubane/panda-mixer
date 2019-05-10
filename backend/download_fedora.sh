#!/usr/bin/env bash
sudo dnf install python3-devel 
pip3 install django --user
pip3 install djangorestframework --user
pip3 install channels --user
pip3 install channels_redis --user
pip3 install djangorestframework_simplejwt --user
pip3 install django-cors-headers
sudo dnf install docker