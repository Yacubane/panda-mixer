#!/usr/bin/env bash
sudo sysctl fs.inotify.max_user_watches=524288
sudo sysctl -p
npm start