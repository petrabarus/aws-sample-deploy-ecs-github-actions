#########
# Simple Dockerfile for running HTML file.
# To run execute
# docker build -t webserver
# docker run -it --rm -d -p 8080:80 --name web webserver
#########
FROM nginx:latest
COPY ./src/index.html /usr/share/nginx/html/index.html
