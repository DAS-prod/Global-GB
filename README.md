# Godavari Basket Abroad

Premium mobile-first Next.js storefront for building a Godavari Basket box for customers abroad.

## Production behavior
- Catalog comes from the Google Sheet configured with `ABROAD_GOOGLE_SHEET_URL`.
- Categories are derived from the live Sheet; there is no hard-coded demo category/product catalog.
- Add-to-box uses a non-blocking toast; it does not open the cart drawer.
- 5 kg is the minimum checkout shipment weight.
- Packaging weight is calculated automatically and is shown only in the final checkout/order summary.
- Box targets: 5 / 10 / 15 / 20 kg.
- Final order continuation is through WhatsApp with the complete order summary and customer details.
- Footer contact details come from environment variables.
- Branding is Godavari Basket Abroad and links back to the parent Godavari Basket India storefront.

## Run
```bash
npm install
npm run dev
```

## Environment
Copy `.env.example` to `.env.local` and set the live values.
