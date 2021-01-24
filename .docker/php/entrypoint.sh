#!/bin/bash

#npm config set cache /var/www/.npm-cache --global
cd frontend && yarn install && cd ..

# shellcheck disable=SC2164
cd backend

chown -R www-data:www-data .
composer install

if ! test -f ".env"; then
    cp .env.example .env
fi

if ! test -f ".env.testing"; then
    cp .env.testing.example .env.testing
fi

php artisan key:generate
php artisan migrate

php-fpm
