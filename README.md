# PicPolish - Marketplace-Ready Product Images in 60 Seconds

AI-powered image processing for Amazon, Flipkart, Meesho & Shopify sellers.

## Features (Phase 1 MVP)

✅ **Step 0:** Marketplace Selection (Amazon, Flipkart, Meesho, Shopify)  
✅ **Step 1:** Drag & drop image upload (up to 5 images free)  
✅ **Step 2:** AI background removal + marketplace optimization  
✅ **Step 3:** Organized ZIP export with upload guides  

### Coming in Phase 2
- 🔜 Template editor for secondary images
- 🔜 Product health scoring
- 🔜 Shadow & reflection effects
- 🔜 User authentication & dashboard

---

## Tech Stack

- **Frontend:** Next.js 14 (App Router), React, Tailwind CSS
- **Backend:** Next.js API Routes (serverless)
- **Database:** Supabase (PostgreSQL)
- **Storage:** Supabase Storage
- **AI:** Photoroom API (background removal)
- **Image Processing:** Sharp
- **Deployment:** Vercel

---

## Prerequisites

- Node.js 18+ installed
- Photoroom API key (get from https://www.photoroom.com/api)
- Supabase account (https://supabase.com)

---

## Installation

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd picpolish
```

### 2. Install dependencies

```bash
npm install
```

This will install all packages from `package.json` (takes 2-3 minutes).

### 3. Set up Supabase

1. Create a new project at https://supabase.com
2. Go to Settings → API to get your credentials
3. Go to SQL Editor and run all migration files in order:
   - `database/migrations/001_create_users.sql`
   - `database/migrations/002_create_products.sql`
   - `database/migrations/003_create_images.sql`
   - `database/migrations/004_create_processing_history.sql`

4. Go to Storage → Create a new bucket:
   - Name: `product-images`
   - Public: Yes
   - File size limit: 10MB
   - Allowed MIME types: `image/jpeg, image/png`

### 4. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your credentials:

```env
# Photoroom API (get from https://www.photoroom.com/api)
PHOTOROOM_API_KEY=your_photoroom_api_key_here

# Supabase (get from your Supabase dashboard)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App Config
NEXT_PUBLIC_APP_URL=http://localhost:3000
FREE_TIER_IMAGE_LIMIT=5
MAX_FILE_SIZE_MB=10
```

### 5. Run development server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

---

## Project Structure

```
picpolish/
├── app/
│   ├── api/              # API routes (backend)
│   │   ├── upload/       # File upload endpoint
│   │   ├── process-main/ # Main image processing
│   │   └── export/       # ZIP creation
│   ├── upload/           # Upload page
│   ├── export/           # Export/download page
│   ├── layout.jsx        # Root layout
│   ├── page.jsx          # Landing page
│   └── globals.css       # Global styles
│
├── components/
│   ├── common/           # Reusable components
│   ├── upload/           # Upload-related components
│   └── product/          # Product display components
│
├── lib/
│   ├── services/         # External services (Photoroom, Storage)
│   ├── supabase/         # Supabase clients
│   └── utils/            # Utilities & constants
│
├── database/
│   └── migrations/       # SQL schema files
│
└── public/               # Static assets
```

---

## API Endpoints

### POST `/api/upload`
Upload product images

**Request:**
```javascript
FormData {
  images: File[],
  marketplaces: JSON.stringify(['Amazon', 'Flipkart'])
}
```

**Response:**
```json
{
  "success": true,
  "productId": "uuid",
  "uploadedUrls": ["url1", "url2"],
  "detectedCategory": "Other"
}
```

### POST `/api/process-main`
Process main product image

**Request:**
```json
{
  "productId": "uuid",
  "mainImageIndex": 0,
  "marketplaces": ["Amazon", "Flipkart"]
}
```

**Response:**
```json
{
  "success": true,
  "processedImages": {
    "Amazon": { "url": "...", "path": "..." },
    "Flipkart": { "url": "...", "path": "..." }
  }
}
```

### POST `/api/export`
Create ZIP export

**Request:**
```json
{
  "productId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "zipUrl": "...",
  "stats": {
    "totalImages": 5,
    "timeSaved": "35m",
    "moneySaved": 1250
  }
}
```

---

## Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Go to https://vercel.com
3. Import your repository
4. Add environment variables in Vercel dashboard
5. Deploy

**Environment variables to add in Vercel:**
- `PHOTOROOM_API_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

---

## Cost Breakdown

### Free Tier (Development)
- Vercel: Free (100GB bandwidth)
- Supabase: Free (500MB database, 1GB storage)
- Photoroom: 100 images/month free OR $20/month for 1,000 images

### Production (10,000 users/month estimate)
- Vercel: $0 (still within free tier)
- Supabase: $25/month (Pro plan)
- Photoroom: ~$200/month (if processing 10,000 images)
- **Total: ~$225/month**

### Revenue Potential
- Charge ₹199 per 20 images
- 500 customers/month = ₹99,500 (~$1,200)
- Profit: ₹99,500 - ₹18,750 (costs) = **₹80,750/month**

---

## Testing

### Test with sample images

1. Go to http://localhost:3000/upload
2. Select marketplaces (Amazon + Flipkart)
3. Upload 1-5 product images
4. Review the auto-organized product tree
5. Wait for processing (~30 seconds)
6. Download the ZIP file
7. Verify folder structure and upload guides

### Common Issues

**"Upload failed"**
- Check file size (max 10MB per image)
- Check file format (only JPG/PNG)
- Check Supabase storage bucket is created and public

**"Background removal failed"**
- Verify Photoroom API key is correct
- Check API key has credits/quota
- Test API key at https://www.photoroom.com/api

**"Processing failed"**
- Check all environment variables are set
- Check Supabase database migrations ran successfully
- Check network connectivity

---

## Roadmap

### Phase 1 (Current - MVP) ✅
- Marketplace selection
- Image upload
- AI background removal
- Main image processing
- ZIP export

### Phase 2 (Next 2-3 weeks)
- Template editor for secondary images
- Product health scoring
- Shadow & reflection effects
- User authentication
- Dashboard with history

### Phase 3 (Future)
- Payment integration (Razorpay)
- Bulk processing (50+ images)
- API access for developers
- WhatsApp notifications
- Advanced templates

---

## Contributing

This is currently a solo project for academic/placement purposes.

---

## License

Private - All rights reserved

---

## Contact

For support or questions, email: support@picpolish.com

---

## Acknowledgments

- Photoroom API for background removal
- Supabase for backend infrastructure
- Vercel for hosting
- Next.js team for the amazing framework