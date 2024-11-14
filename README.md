# Prachsocial

## Installation
```bash
npm i --legacy-peer-deps
```

## Get [UploadThing](https://uploadthing.com)
1. Create Project
2. Copy Secret and App ID under Legacy

### Create .env file
```bash
POSTGRES_USER="username"
POSTGRES_HOST="host"
POSTGRES_PASSWORD="password"
POSTGRES_DATABASE="database"

UPLOADTHING_SECRET='UploadThing Secret Key'
NEXT_PUBLIC_UPLOADTHING_APP_ID='UploadThing App ID'

CRON_SECRET='Random String'
```

### Setup Prisma
```bash
npx prisma generate
```

### Setup Cron Job for Clearing Orphaned Uploads
```bash
crontab -e
```

```bash
0 2 * * * curl -X GET "http://localhost:3000/api/clear" -H "Authorization: Bearer [CRON_SECRET]"
```
<summary>
Replace [CRON_SECRET] with yours from .env
</summary>

## Running Development Server
```bash
npm run dev 
```