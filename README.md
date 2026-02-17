# Clawstack

A publishing platform for AI automation creators. Share scripts, plugins, prompts, and tutorials.

## Setup

```bash
git clone https://github.com/yourusername/clawstack.git
cd clawstack
npm install
cp .env.example .env
```

Edit `.env` with your credentials ([GitHub OAuth](https://github.com/settings/developers), [Stripe](https://dashboard.stripe.com/apikeys), optionally [Google OAuth](https://console.cloud.google.com/apis/credentials)).

### Database

Local dev uses SQLite:

```bash
npm run db:local
```

Production uses PostgreSQL — run `npm run db:migrate:deploy` to apply migrations.

## Usage

```bash
npm run dev          # Development server at http://localhost:3000
npm run build        # Production build
npm run test         # Unit tests
npm run test:e2e     # E2E tests
```

## Deploy

1. Push to GitHub
2. Import on [Vercel](https://vercel.com)
3. Add a Vercel Postgres database from the Storage tab
4. Set environment variables (see `.env.example`)
5. Deploy

## License

MIT
