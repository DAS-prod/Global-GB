"use client";

function WhatsAppIcon() {
  return (
    <svg
      viewBox="0 0 32 32"
      width="28"
      height="28"
      aria-hidden="true"
      fill="currentColor"
    >
      <path d="M16.04 3C9.41 3 4 8.32 4 14.88c0 2.09.55 4.13 1.6 5.92L3.5 28l7.4-1.94a12.2 12.2 0 0 0 5.13 1.12h.01C22.67 27.18 28 21.86 28 15.3 28 8.74 22.67 3 16.04 3Zm0 21.98a10 10 0 0 1-5.1-1.4l-.37-.22-4.39 1.15 1.17-4.25-.24-.39a9.72 9.72 0 0 1-1.51-5.2c0-5.35 4.4-9.7 9.83-9.7 5.42 0 9.82 4.35 9.82 9.7 0 5.36-4.4 9.71-9.21 10.31Zm5.39-7.28c-.3-.15-1.76-.86-2.03-.96-.27-.1-.47-.15-.66.15-.2.3-.77.96-.94 1.16-.17.2-.34.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.77-1.48-1.72-1.65-2.02-.17-.3-.02-.46.13-.61.14-.14.3-.34.44-.51.15-.17.2-.3.3-.49.1-.2.05-.37-.02-.52-.08-.15-.67-1.6-.92-2.18-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.47s1.07 2.87 1.22 3.06c.15.2 2.1 3.17 5.09 4.45.71.3 1.27.49 1.7.63.72.22 1.36.19 1.87.11.57-.08 1.76-.71 2.01-1.4.25-.7.25-1.3.17-1.43-.07-.12-.27-.19-.57-.34Z" />
    </svg>
  );
}

export default function FloatingWhatsApp() {
  /*
   * ENV number is used when available.
   *
   * Temporary fallback keeps the button visible
   * before your Vercel ENV is configured.
   */
  const rawNumber =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ||
    "919618851406";

  const whatsappNumber = rawNumber.replace(/\D/g, "");

  const greeting = encodeURIComponent(
    "Hi Godavari Basket! I would like to know more about your products."
  );

  return (
    <a
      className="floatingWhatsApp"
      href={`https://wa.me/${whatsappNumber}?text=${greeting}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Godavari Basket on WhatsApp"
      title="Chat with us on WhatsApp"
    >
      <WhatsAppIcon />

      <span className="floatingWhatsAppLabel">
        WhatsApp
      </span>
    </a>
  );
}
