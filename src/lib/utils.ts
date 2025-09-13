export const fmtMoney = (n: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);

export const tierLabel = (t: { grams: number; priceEur: number }) =>
  `${fmtMoney(t.priceEur)} / ${t.grams}g`;

export const whatsAppUrl = (p: { name: string; slug: string }, grams: number, price: number) => {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || ""; // définir dans .env
  const base = typeof window !== "undefined" ? window.location.origin : "";
  const txt = encodeURIComponent(
    `Bonjour, je souhaite commander: ${p.name} (${grams}g) – ${fmtMoney(price)}.\nLien: ${base}/produit/${p.slug}`
  );
  return phone ? `https://wa.me/${phone}?text=${txt}` : `/commander?product=${encodeURIComponent(p.slug)}&g=${grams}`;
};