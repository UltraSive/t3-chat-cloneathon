## env variables
```
ORIGIN=http://localhost:5173
DATABASE_URL=postgres://
OPENROUTER_API_KEY=sk-or-v1-
CONVEX_DEPLOYMENT=dev:
PUBLIC_CONVEX_URL=https://project-id.convex.cloud
GOOGLE_OAUTH_CLIENT_ID=.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=GOCSPX-
PUBLIC_STRIPE_KEY=pk_test_
PRIVATE_STRIPE_KEY=sk_test_
PRIVATE_STRIPE_WEBHOOK_SECRET=whsec_
PUBLIC_STRIPE_PRICE_ID=price_
```

## Build Instructions
1. Set the environment variables to the configuration for your services.
2. Install dependancies.
```
npm install
```
3. Initialize postgres database.
```
npm run generate && npm run migrate
```
4. Initialize convex document schema.
```
npx convex dev
```
5. Build it
```
npm run build.
```

## Run Instructions
1. Run the build.
```
node build
```
