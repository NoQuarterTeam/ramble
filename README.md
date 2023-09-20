# Ramble

## React + Remix + TypeScript + Prisma + Expo + React Native

## Get Started

**Must have node and pnpm installed and setup locally**

1. `pnpm i`
2. Create db and add connection string to .env
3. `cd packages/database pnpm db:push`

Make sure you have created a .env file with the right values, you can use .env.example as the template

## Development

`pnpm run dev`

## Production

### Mailers

- Create a Resend account and set a RESEND_API_KEY environment variable in .env

### Deployment

We are using Vercel
