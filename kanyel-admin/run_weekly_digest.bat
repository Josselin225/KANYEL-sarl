@echo off
cd /d C:\KANYEL\kanyel-admin
venv\Scripts\python.exe manage.py send_weekly_digest >> logs\weekly_digest.log 2>&1
