# Google Sheet catalog for Godavari Basket Global

The website catalog is production-driven from Google Sheets only. There is no demo bundle fallback.

Use this exact header row:

`id | category | name | subtitle | weight_kg | price_inr | image | items | tags | popular | active`

Supported category names:
- Pickles
- Sweets
- Snacks
- Podis
- Cashews
- Essentials
- 90's Memories

Rules:
- `weight_kg`: numeric value such as `1`, `1.2`, `1.5`, `2`
- `price_inr`: number only
- `items`: separate values with `;`
- `tags`: separate values with `;`
- `popular`: `TRUE` or `FALSE`
- `active`: `TRUE` or `FALSE`
- `image`: full image URL; when blank, the matching category image is used

Current environment key:
`GLOBAL_GOOGLE_SHEET_URL`

If the Sheet cannot be loaded, the customer sees a clean catalog-unavailable state and can contact the WhatsApp concierge.
