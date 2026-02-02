# Clawstack

A publishing platform for AI automation creators. Share scripts, plugins, prompts, and tutorials with the Clawstack community.

## Features

- **Rich Publishing** - Write articles with syntax-highlighted code blocks
- **One-Click Install** - Readers can install scripts directly to Clawstack
- **Paid Subscriptions** - Monetize your content with Stripe
- **AI-Native Format** - .claw file downloads and deep linking support
- **Community** - Comments and subscriber engagement

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Styling**: Tailwind CSS
- **Database**: Prisma ORM with PostgreSQL (Vercel Postgres, Neon, Supabase)
- **Auth**: NextAuth.js with GitHub OAuth
- **Payments**: Stripe Checkout & Connect
- **Editor**: Tiptap rich text editor
- **Testing**: Vitest (unit) + Playwright (E2E)

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- GitHub OAuth App (for authentication)
- Stripe account (for payments)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/clawstack.git
cd clawstack
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
- Create a GitHub OAuth app at https://github.com/settings/developers
- Get Stripe keys from https://dashboard.stripe.com/apikeys

4. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

5. Start the development server:
```bash
npm run dev
```

Visit http://localhost:3000

## Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
npm run test       # Run unit tests
npm run test:watch # Run tests in watch mode
npm run test:e2e   # Run E2E tests
npm run db:push    # Push schema to database
npm run db:studio  # Open Prisma Studio
```

## Project Structure

```
clawstack/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   ├── dashboard/         # Creator dashboard
│   │   ├── [username]/        # Publication pages
│   │   └── login/             # Auth pages
│   ├── components/            # React components
│   │   ├── content/          # Content display components
│   │   ├── editor/           # Post editor
│   │   ├── landing/          # Landing page sections
│   │   ├── layout/           # Header, Footer
│   │   ├── providers/        # Context providers
│   │   └── ui/               # Reusable UI components
│   ├── lib/                   # Utilities and configs
│   └── types/                 # TypeScript definitions
├── prisma/                    # Database schema
├── __tests__/                 # Test files
│   ├── unit/                 # Unit tests
│   └── e2e/                  # End-to-end tests
└── public/                    # Static assets
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project on [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy

### Environment Variables for Production

**Required for Vercel:**

1. **Database** - Add Vercel Postgres from Storage tab, it auto-populates:
   - `DATABASE_URL` - Pooled connection string
   - `DIRECT_URL` - Direct connection for migrations

2. **Auth & API Keys:**
```
NEXTAUTH_SECRET=<run: openssl rand -base64 32>
NEXTAUTH_URL=https://your-app.vercel.app
GITHUB_ID=<from github.com/settings/developers>
GITHUB_SECRET=<from GitHub OAuth app>
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

## Clawstack Integration

### Deep Linking

Scripts can be installed via deep link:
```
clawstack://install?url=https://your-site.com/user/script-name
```

### .claw File Format

```json
{
  "version": "1.0",
  "title": "Script Name",
  "description": "What it does",
  "author": "Author Name",
  "category": "SCRIPT",
  "scripts": ["script content here"]
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm run test && npm run test:e2e`
5. Submit a pull request

## License

MIT
