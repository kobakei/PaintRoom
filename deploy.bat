@echo off

git add .
git commit -m 'hoge'
git push heroku master
heroku open

pause