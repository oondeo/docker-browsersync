# docker-browsersync

Browsersync configured to work behind a nginx proxy redirecting to another nginx proxy

example 

```
docker run -d --name=bs -v /var/www:/var/www --link nginx:prueba.com -e URL="prueba.com" oondeo/browsersync

```

Environment variables:
#DEBEMOS crear el contenedor con link nginx:URL
ENV GENERATE="false" PORT='80' URL='http://172.17.0.1' IP='172.17.0.1' ROOT="/var/www" \
    CSS_DEST_PATH="${ROOT}/css" JS_DEST_PATH="${ROOT}/js" VERSION_FILE="${ROOT}/Version"
#This vars are a list of dirs to watch
ENV CSS_PATH="${ROOT}/css:${ROOT}/skin:${ROOT}/wp-content/themes" JS_PATH="${ROOT}/js:${ROOT}/skin:${ROOT}/wp-content/themes" LESS_PATH="${ROOT}/skin:${ROOT}/wp-content/themes" SASS_PATH="${ROOT}/skin:${ROOT}/wp-content/themes" PHTML_PATH="${ROOT}/skin:${ROOT}/wp-content/themes" CODE_PATH="${ROOT}/app:${ROOT}/skin" IMAGE_PATH=""



