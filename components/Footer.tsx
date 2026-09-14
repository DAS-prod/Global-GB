import Link from "next/link";

export default function Footer() {
  return (
    <footer className="siteFooter">
      <div className="footerValues"><div className="shell footerValueGrid"><div><b>01</b><span><strong>ROOTED IN GODAVARI</strong><small>Food, craft and memories from the region.</small></span></div><div><b>02</b><span><strong>PACKED WITH CARE</strong><small>Thoughtful combinations made to travel.</small></span></div><div><b>03</b><span><strong>MADE TO FEEL LIKE HOME</strong><small>One Godavari box, wherever you are now.</small></span></div></div></div>
      <div className="shell footerGrid">
        <div className="footerBrand"><span className="footerEmblem">G</span><div><strong>GODAVARI BASKET</strong><small>FROM GODAVARI, WITH LOVE.</small><p>A little piece of the Godavari region—its flavours, traditions and familiar memories—made easier to carry across the world.</p></div></div>
        <div className="footerLinks"><h3>EXPLORE</h3><Link href="/build">Build Your Box</Link><Link href="/bundles">All Bundles</Link><Link href="/gifting">Gifting</Link><Link href="/about">Our Godavari</Link></div>
        <div className="footerLinks"><h3>SUPPORT</h3><a href="https://wa.me/919618851406" target="_blank" rel="noreferrer">WhatsApp Concierge</a><Link href="/build">5 kg+ Orders</Link><Link href="/checkout">Checkout</Link></div>
        <div className="footerNote"><p>“Food has a way of carrying a place with it.”</p><span>Rooted at home. Loved everywhere.</span></div>
      </div>
      <div className="footerBottom shell"><span>© {new Date().getFullYear()} Godavari Basket.</span><span>Godavari → the world · thoughtfully packed</span></div>
    </footer>
  );
}
