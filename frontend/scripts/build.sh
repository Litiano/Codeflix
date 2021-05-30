#!/bin/bash

rm -rf /var/www/html/backend/public/admin-frontend
cp -R /var/www/html/frontend/build /var/www/html/backend/public/admin-frontend

mkdir -p /var/www/html/backend/resources/views/admin-frontend

mv /var/www/html/backend/public/admin-frontend/index.html /var/www/html/backend/resources/views/admin-frontend/index.html
