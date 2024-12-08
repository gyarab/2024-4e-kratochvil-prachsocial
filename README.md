# **PrachSocial**

# Installation
```bash
npm i --legacy-peer-deps
```

## Get [UploadThing](https://uploadthing.com)
1. Create Project
2. Copy *Secret* and *App ID* under Legacy
<details>
Fill in these values into .env
</details>

## Get [Stream](https://getstream.io)
1. Create App
2. Copy *Key* and *Secret* under App Access Keys
3. Turn off Threads & Replies under *Chat Messaging > Channel Types > messaging*
<details>
Fill in these values into .env
</details>

## Create [Google Cloud Project](https://console.cloud.google.com/)
1. Create Project
### OAuth Consent Screen
2. Select External
3. Fill in required fields
4. Add *.../auth/userinfo.email* and *.../auth/userinfo.profile* under Scopes

5. Publish Project
### Credentials
6. Create *OAuth client ID*
7. Select *Web Application* type
8. Add *http://localhost:3000/api/auth/callback/google* under ***Authorized redirect URIs***
9. Copy *Client ID* and *Client secret*
<details>
Fill in these values into .env
</details>

## Create .env file
```bash
POSTGRES_USER="username"
POSTGRES_HOST="host"
POSTGRES_PASSWORD="password"
POSTGRES_DATABASE="database"

UPLOADTHING_SECRET='UploadThing Secret Key'
NEXT_PUBLIC_UPLOADTHING_APP_ID='UploadThing App ID'

NEXT_PUBLIC_STREAM_KEY='Stream Key'
STREAM_SECRET='Stream Secret'

GOOGLE_CLIENT_ID='CLIENT_ID.apps.googleusercontent.com'
GOOGLE_CLIENT_SECRET='CLIENT_SECRET'

CRON_SECRET='Random String'
NEXT_PUBLIC_BASE_URL='http://localhost:3000'
```

## Setup Prisma
```bash
npx prisma generate
npx prisma db push
```

## Setup Cron Job for Clearing Orphaned Uploads
```bash
crontab -e
```

```bash
0 2 * * * curl -X GET "http://localhost:3000/api/clear" -H "Authorization: Bearer [CRON_SECRET]"
```
<details>
Replace [CRON_SECRET] with yours from .env
</details>

# Running Development Server
```bash
npm run dev
```