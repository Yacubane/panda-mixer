#!/usr/bin/env bash
cd $(dirname $0)
cd panda_mixer
sudo sysctl fs.inotify.max_user_watches=524288
sudo sysctl -p
npm start