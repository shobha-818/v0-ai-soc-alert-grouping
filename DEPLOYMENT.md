# Deployment Guide

## Prerequisites

- Vercel account
- GitHub repository with the code
- Groq API integration (via Vercel Marketplace)
- Neon PostgreSQL integration (via Vercel Marketplace)

## Step 1: Prepare Environment Variables

Add to your Vercel project settings:

\`\`\`
DATABASE_URL=postgresql://user:password@host/database
GROQ_API_KEY=<your-groq-api-key>
API_KEYS=<comma-separated-api-keys>
\`\`\`

Generate API keys:
\`\`\`bash
node -e "const {generateApiKey}=require('./lib/auth');console.log(generateApiKey())"
\`\`\`

## Step 2: Create Database Schema

Run the migration script in your Neon dashboard or via CLI:

\`\`\`bash
psql $DATABASE_URL < scripts/01_create_tables.sql
\`\`\`

## Step 3: Deploy to Vercel

### Option A: GitHub Integration
1. Push code to GitHub
2. Connect repo to Vercel
3. Vercel auto-deploys on push

### Option B: Vercel CLI
\`\`\`bash
npm install -g vercel
vercel deploy
\`\`\`

## Step 4: Verify Deployment

1. Check Vercel dashboard for successful build
2. Test API endpoint:
   \`\`\`bash
   curl -H "X-API-Key: your-key" https://your-app.vercel.app/api/sessions
   \`\`\`
3. Visit application URL and test alert grouping

## Monitoring

### Health Checks

Monitor these metrics in Vercel:
- Function duration (< 5s target)
- Database connection pool usage
- API error rate (< 1%)

### Logs

View logs in Vercel dashboard:
1. Select project
2. Navigate to "Deployments"
3. Click "Functions" tab for server logs

### Analytics

Enable Vercel Analytics to track:
- Page load times
- API latency
- User interactions

## Scaling Considerations

- **Database**: Neon auto-scales, monitor connections
- **API Rate Limit**: Adjust in `lib/security.ts`
- **Groq API**: Monitor token usage in dashboard

## Troubleshooting

### Database Connection Failed
- Verify DATABASE_URL is correct
- Check Neon IP whitelist includes Vercel IPs
- Test with: `psql $DATABASE_URL "SELECT 1"`

### API Key Rejected
- Verify API_KEYS env var is set
- Include header: `X-API-Key: your-key`
- Check for extra spaces in API_KEYS

### Groq API Timeout
- Check API quota in Groq dashboard
- Verify GROQ_API_KEY is set
- Monitor Groq service status

## Rollback Procedure

If deployment has issues:
1. Vercel automatically keeps previous deployments
2. Go to "Deployments" in Vercel dashboard
3. Click "Promote to Production" on a previous stable version
\`\`\`
