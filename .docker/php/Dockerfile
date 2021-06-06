FROM php:8.0-fpm-alpine AS base

RUN apk add --no-cache shadow openssl bash nano freetype-dev libjpeg-turbo-dev libpng-dev nodejs npm yarn libzip-dev

RUN docker-php-ext-install pdo pdo_mysql zip
RUN docker-php-ext-configure gd --with-freetype --with-jpeg
RUN docker-php-ext-install -j$(nproc) gd

ENV DOCKERIZE_VERSION v0.6.1
RUN wget https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && tar -C /usr/local/bin -xzvf dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && rm dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz

RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

RUN touch /home/www-data/.bashrc | echo "PS1='\w\$ '" >> /home/www-data/.bashrc

######################### FPM #############################################
FROM base AS php

RUN usermod -u 1000 www-data && groupmod -g 1000 www-data
USER www-data

######################### XDEBUG ##########################################
FROM base AS xdebug

RUN apk add --no-cache $PHPIZE_DEPS
RUN pecl install xdebug
RUN docker-php-ext-enable xdebug

RUN usermod -u 1000 www-data && groupmod -g 1000 www-data
USER www-data
