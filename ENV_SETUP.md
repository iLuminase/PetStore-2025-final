# Environment Setup Guide

## Overview

This project uses environment variables for sensitive configuration like OAuth credentials, JWT secrets, and database passwords.

## Local Development Setup

### 1. Copy the example file

```bash
# Copy .env.example to .env
cp .env.example .env
```

### 2. Edit `.env` with your credentials

```bash
# Open in your editor
code .env  # VS Code
notepad .env  # Windows Notepad
```

### 3. Fill in the values

```bash
# Google OAuth (get from Google Console)
GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-actual-client-secret

# JWT Secret (generate a strong random string)
JWT_SECRET=your-secure-random-jwt-secret-at-least-256-bits

# Database (use your MySQL credentials)
DB_USERNAME=root
DB_PASSWORD=your-mysql-password
```

## Getting Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new project or select existing one
3. Click **Create Credentials** → **OAuth client ID**
4. Choose **Web application**
5. Add authorized redirect URIs:
   - `http://localhost:4200/auth/callback`
   - `http://localhost:8090/oauth2/callback`
6. Copy the **Client ID** and **Client Secret**

## Generating JWT Secret

### Option 1: Online Generator

- Use: https://www.grc.com/passwords.htm
- Copy the "63 random alpha-numeric characters" string

### Option 2: Node.js

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Option 3: PowerShell

```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

## Loading Environment Variables

### Option A: Spring Boot (Recommended)

Spring Boot automatically reads environment variables. No additional setup needed.

### Option B: IntelliJ IDEA

1. **Run** → **Edit Configurations**
2. Select your application
3. **Environment variables** → Click folder icon
4. Add each variable from `.env` file
5. Click **OK**

### Option C: Eclipse

1. **Run** → **Run Configurations**
2. Select your application
3. **Environment** tab
4. Click **New** for each variable
5. Click **Apply**

### Option D: VS Code

1. Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "java",
      "name": "Auth API",
      "request": "launch",
      "mainClass": "com.auth_api.AuthApiApplication",
      "envFile": "${workspaceFolder}/.env"
    }
  ]
}
```

### Option E: Command Line (PowerShell)

```powershell
# Load .env file
Get-Content .env | ForEach-Object {
    if ($_ -match '^([^#][^=]+)=(.*)$') {
        [System.Environment]::SetEnvironmentVariable($matches[1], $matches[2])
    }
}

# Run application
cd be/auth-api
mvn spring-boot:run
```

### Option F: Command Line (Bash/Linux/Mac)

```bash
# Load .env and run
export $(cat .env | xargs) && cd be/auth-api && mvn spring-boot:run
```

## Production Deployment

### Docker

```dockerfile
# Dockerfile
ENV GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
ENV GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
ENV JWT_SECRET=${JWT_SECRET}
```

### Kubernetes

```yaml
# secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: petstore-secrets
type: Opaque
stringData:
  GOOGLE_CLIENT_ID: your-client-id
  GOOGLE_CLIENT_SECRET: your-client-secret
  JWT_SECRET: your-jwt-secret
```

### Cloud Platforms

- **Heroku**: Dashboard → Settings → Config Vars
- **AWS Elastic Beanstalk**: Configuration → Software → Environment properties
- **Azure App Service**: Settings → Configuration → Application settings
- **Google Cloud Run**: Deploy → Variables & Secrets

## Security Best Practices

✅ **DO:**

- Keep `.env` in `.gitignore`
- Use different secrets for dev/staging/production
- Rotate secrets regularly
- Use strong, random JWT secrets (256+ bits)
- Limit OAuth redirect URIs to actual domains

❌ **DON'T:**

- Commit `.env` to Git
- Share secrets via email/chat
- Use simple/guessable secrets
- Reuse secrets across projects
- Hardcode secrets in code

## Troubleshooting

### Error: Could not resolve placeholder 'GOOGLE_CLIENT_ID'

**Solution:**

1. Verify `.env` file exists in project root
2. Check environment variables are loaded
3. Restart your IDE/terminal
4. Try setting variables manually in IDE run configuration

### Error: OAuth redirect_uri_mismatch

**Solution:**

1. Check Google Console → Credentials → OAuth 2.0 Client
2. Add exact redirect URI: `http://localhost:4200/auth/callback`
3. Wait 5 minutes for changes to propagate

### Error: JWT signature does not match

**Solution:**

1. Ensure JWT_SECRET is same across all services
2. Check secret is at least 256 bits (32+ characters)
3. Verify no extra spaces/newlines in secret

## File Structure

```
petstore-microservices/
├── .env                 # Your local secrets (NOT in git)
├── .env.example         # Template (safe to commit)
├── .gitignore           # Includes .env
└── ENV_SETUP.md         # This file
```

## Need Help?

- **OAuth Setup**: See `be/auth-api/OAUTH_TROUBLESHOOTING.md`
- **Database Setup**: See `database/README.md`
- **GitHub Deployment**: See `DEPLOY_GITHUB.md`
