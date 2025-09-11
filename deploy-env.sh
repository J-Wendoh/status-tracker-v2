#!/bin/bash

# Set environment variables for Vercel deployment
echo "Setting up environment variables for Vercel deployment..."

# Add environment variables to Vercel
vercel env add NEXT_PUBLIC_SUPABASE_URL production <<< "https://nseovcbrrifjgyrugdwz.supabase.co"
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production <<< "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zZW92Y2Jycmlmamd5cnVnZHd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5NjE0MDgsImV4cCI6MjA3MjUzNzQwOH0.KWkqabeCNmwapyLqM3aRS0QrWrwPHDQxPgOH3eTy6W4"
vercel env add SUPABASE_SERVICE_ROLE_KEY production <<< "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zZW92Y2Jycmlmamd5cnVnZHd6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Njk2MTQwOCwiZXhwIjoyMDcyNTM3NDA4fQ.boXPcBcMJIR55dLHRwcIDfl3MC42xgFC2Re6G-uj_tA"
vercel env add SUPABASE_URL production <<< "https://nseovcbrrifjgyrugdwz.supabase.co"
vercel env add SUPABASE_JWT_SECRET production <<< "g3AqooAqUh52v5lCsrSKa0495ImkBUgaE5fAlbEuF4z0iHVUIZ5QqY9O1UBpw8xkcbKVZszuyK1mMhcWMYAouA=="

echo "Environment variables added! Now redeploying..."
vercel --prod

echo "Deployment complete!"