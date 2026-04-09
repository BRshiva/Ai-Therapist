@echo off
echo ==========================================
echo FIXING AI THERAPIST VERCEL DEPLOYMENT
echo ==========================================
echo 1. Staging fixed files...
git add .
echo 2. Committing changes...
git commit -m "Fix: Bypassed Google Auth and updated Render backend URL"
echo 3. Pushing to GitHub (Requires your GitHub login/pass)...
git push origin master:main
echo ==========================================
echo If the push succeeded, your Vercel site will
echo work in about 2 minutes.
echo ==========================================
pause
