# Godavari Basket Global

Premium mobile-first Next.js storefront for building a Global Godavari Box.

## Production behavior
- Catalog comes only from the Google Sheet configured in `.env.local`.
- No demo/fallback product catalog is included.
- Add-to-box uses a non-blocking toast; it does not open the cart drawer.
- 5 kg is the minimum checkout weight.
- Box targets: 5 / 10 / 15 / 20 kg.
- Cart includes Continue Shopping and Checkout.
- Checkout shows full selected bundle details and collects customer delivery/contact details.
- Final order continuation is through WhatsApp with the complete order summary and customer details.
- The old Global Delivery page redirects to Checkout and is no longer shown in navigation.

## Run
```bash
npm install
npm run dev
```

## Environment
`.env.local`:
```env
GLOBAL_GOOGLE_SHEET_URL=YOUR_PUBLISHED_CSV_URL
NEXT_PUBLIC_WHATSAPP_NUMBER=91XXXXXXXXXX
```

The current project includes the supplied public Google Sheet URL and Godavari Basket WhatsApp number in `.env.local` because this project is configured to use that file directly. Do not place private credentials or secret keys in a committed `.env.local`.

## Sept 2026 mobile production polish
- Concierge modal is mobile scroll-safe and no longer clips the final action.
- Box-size selection goes directly to the Build catalog and keeps the selected target.
- Mobile bundle grids render two cards per row.
- Bundle/category images use fit-first mobile treatment to reduce cropping.
- Box-size typography uses the Godavari serif system for a more premium feel.
- Login/account tracking is intentionally not included in this build and will be handled separately.
