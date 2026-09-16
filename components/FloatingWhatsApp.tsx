"use client";

function WhatsAppIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="27"
      height="27"
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M12.04 2a9.84 9.84 0 0 0-8.4 14.96L2 22l5.18-1.61A9.94 9.94 0 1 0 12.04 2Zm0 17.87a8.04 8.04 0 0 1-4.1-1.12l-.29-.17-3.07.95.98-2.99-.19-.31a8.02 8.02 0 1 1 6.67 3.64Zm4.4-6.01c-.24-.12-1.43-.71-1.65-.79-.22-.08-.38-.12-.54.12-.16.24-.62.79-.76.95-.14.16-.28.18-.52.06-.24-.12-1.02-.38-1.94-1.2-.72-.64-1.2-1.43-1.34-1.67-.14-.24-.02-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.47-.4-.4-.54-.41h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2 0 1.18.86 2.32.98 2.48.12.16 1.69 2.58 4.1 3.62.57.25 1.02.4 1.37.51.58.18 1.1.16 1.51.1.46-.07 1.43-.58 1.63-1.15.2-.57.2-1.06.14-1.16-.06-.1-.22-.16-.46-.28Z"
      />
    </svg>
  );
}

export default function FloatingWhatsApp() {
  const whatsappNumber =
    process.env
      .NEXT_PUBLIC_WHATSAPP_NUMBER
      ?.trim() || "";

  /*
   * Hide automatically if ENV number
   * hasn't been configured.
   */
  if (!whatsappNumber) {
    return null;
  }

  /*
   * Simple greeting only.
   * No cart information.
   */
  const greeting =
    encodeURIComponent(
      "Hi Godavari Basket! I would like to know more about your products."
    );

  return (
    <a
      className="floatingWhatsApp"
      href={`https://wa.me/${whatsappNumber}?text=${greeting}`}
      target="_blank"
      rel="noreferrer"
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
