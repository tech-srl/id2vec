#!/usr/bin/env bash
# This script installs necessary packages that are required to run id2vec.

sudo apt-get update
sudo apt install nodejs
sudo apt install npm
sudo apt install node-typescript
npm install ts-morph@4.3.2
npm install fs
npm install path

sudo apt install python3-pip
# pip3 install tensorflow
pip3 install tensorflow-gpu==1.14
# if pip3 outputs MemoryError when trying to install tensorflow, try running the command with the following flag:
# pip3 --no-cache-dir install tensorflow

npm install gitbook
# npm install threads tiny-worker
# npm install node-threadpool