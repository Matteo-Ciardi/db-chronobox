const transporter = require("../middlewares/mailer");
const path = require("path");

function normalizeImg(img) {
  if (!img) return null;

  try {
    const u = new URL(img);
    img = u.pathname;
  } catch { }

  img = String(img).trim();

  const idx = img.indexOf("/imgs/");
  if (idx !== -1) return img.slice(idx);

  if (!img.startsWith("/")) return `/imgs/${img}`;

  return `/imgs/${path.basename(img)}`;
}

function formatItemsText(items = []) {
  if (!Array.isArray(items) || items.length === 0) return "Nessun articolo";

  return items
    .map((i) => {
      const qty = Number(i.quantity ?? 1);
      const unit = Number(i.price ?? i.unit_price ?? 0);
      const sub = unit * qty;
      return `- ${i.name} — €${unit.toFixed(2)} x${qty} = €${sub.toFixed(2)}`;
    })
    .join("\n");
}

function buildAttachments(items = []) {
  if (!Array.isArray(items)) return [];

  return items
    .map((i, idx) => {
      if (!i._relImg) return null;

      const clean = i._relImg.startsWith("/") ? i._relImg.slice(1) : i._relImg;
      return {
        filename: path.basename(clean),
        path: path.join(__dirname, "..", "public", clean),
        cid: `item${idx}@chronobox`,
      };
    })
    .filter(Boolean);
}

function formatItemsHtml(items = []) {
  if (!Array.isArray(items) || items.length === 0) {
    return `<p>Nessun articolo</p>`;
  }

  return items
    .map((i, idx) => {
      const qty = Number(i.quantity ?? 1);
      const unit = Number(i.price ?? i.unit_price ?? 0);
      const sub = unit * qty;
      const cid = i._relImg ? `cid:item${idx}@chronobox` : null;

      return `
        <div style="display:flex; gap:14px; padding:12px 0; border-bottom:1px solid #eee; align-items:center;">
          ${cid
          ? `
            <img 
              src="${cid}" 
              alt="${i.name}" 
              style="width:90px; height:90px; object-fit:cover; border-radius:10px; border:1px solid #ddd;"
            />
          `
          : ""
        }
          <div>
            <div style="font-weight:700; font-size:15px; margin-bottom:4px;">${i.name}</div>
            <div style="font-size:14px;">
              €${unit.toFixed(2)} 
              <span style="opacity:.7;">x ${qty}</span>
              <span style="margin-left:8px; font-weight:700;">= €${sub.toFixed(2)}</span>
            </div>
          </div>
        </div>
      `;
    })
    .join("");
}

function calcItemsTotal(items = []) {
  if (!Array.isArray(items)) return 0;
  return items.reduce((sum, i) => {
    const qty = Number(i.quantity ?? 1);
    const unit = Number(i.price ?? i.unit_price ?? 0);
    return sum + unit * qty;
  }, 0);
}

async function sendOrderEmails(order) {
  const {
    id,
    customerName,
    customerEmail,
    shippingAddress,
    billingAddress,
    items = [],
    shippingDate,
    letterContent,
  } = order;

  const safeItems = items.map((i) => ({
    ...i,
    _relImg: normalizeImg(i.img),
  }));

  const itemsText = formatItemsText(safeItems);
  const itemsHtml = formatItemsHtml(safeItems);
  const itemsTotal = calcItemsTotal(safeItems);
  const attachments = buildAttachments(safeItems);

  // ===========================
  // Spedizione: 30€ fino a 169€
  //            gratis da 170€ in su
  // (la soglia è sul totale PRODOTTI)
  // ===========================
  const shippingCost = itemsTotal > 169 ? 0 : 30;
  const shippingLabel =
    shippingCost === 0
      ? "Spedizione gratis"
      : `Spedizione: €${shippingCost.toFixed(2)}`;

  // Totale visualizzato in email = prodotti + spedizione
  const grandTotal = itemsTotal + shippingCost;

  // ==========================================================
  //  Costruisco una capsula per ogni quantità acquistata
  // ==========================================================
  const capsules = safeItems.flatMap((i) => {
    const qty = Number(i.quantity ?? 1);

    // prendo lettera/data dall'item se esistono, altrimenti fallback ai campi ordine
    const letter = i.letterContent ?? i.letter ?? letterContent ?? "—";
    const openDate = i.shippingDate ?? i.open_date ?? shippingDate ?? "—";

    return Array.from({ length: qty }, () => ({
      name: i.name,
      letter,
      openDate,
    }));
  });

  const capsulesText =
    capsules.length > 0
      ? capsules
        .map(
          (c, idx) =>
            `Capsula ${idx + 1}${c.name ? ` (${c.name})` : ""}:
Data consegna/apertura: ${c.openDate}
Lettera: ${c.letter}`
        )
        .join("\n\n")
      : `Data consegna/apertura: ${shippingDate || "—"}\nLettera: ${letterContent || "—"
      }`;

  const capsulesHtml =
    capsules.length > 0
      ? capsules
        .map(
          (c, idx) => `
  <div style="background:#f7f7fb;border:1px solid #e6e6f0;padding:12px;border-radius:10px;font-size:14px; margin-top:8px;">
    <p style="margin:0 0 6px;"><b>Capsula ${idx + 1}${c.name ? ` — ${c.name}` : ""
            }</b></p>
    <p style="margin:0 0 6px;"><b>Data consegna/apertura:</b> ${c.openDate
            }</p>
    <p style="margin:0;"><b>Lettera:</b> ${c.letter}</p>
  </div>
`
        )
        .join("")
      : `
  <div style="background:#f7f7fb;border:1px solid #e6e6f0;padding:12px;border-radius:10px;font-size:14px;">
    <p style="margin:0 0 6px;"><b>Data consegna/apertura:</b> ${shippingDate || "—"
      }</p>
    <p style="margin:0;"><b>Lettera:</b> ${letterContent || "—"}</p>
  </div>
`;

  // ============================
  // MAIL CLIENTE
  // ============================
  const customerMail = {
    from: process.env.SMTP_USER,
    to: customerEmail,
    subject: `Chronobox – Ordine #${id} ricevuto`,
    text: `🚀 Ciao ${customerName}, hai conservato un ricordo 💛
Ordine avvenuto con successo, ora fai parte di Chronobox!

I TUOI DATI:
Nome: ${customerName}
Email: ${customerEmail}

Dettagli capsula:
${capsulesText}

Riepilogo prodotti:
${itemsText}

${shippingLabel}
Totale ordine: €${grandTotal.toFixed(2)}

Grazie dal team di Chronobox!
`,
    html: `
<div style="margin:0;padding:0;background:#f6efe6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f6efe6;padding:24px 0;">
    <tr>
      <td align="center">
        <table width="680" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 6px 18px rgba(0,0,0,0.08);font-family:Arial,sans-serif;color:#111;">
          <tr>
            <td style="background:#6b3f2a;padding:22px 26px;text-align:center;color:#fff;">
              <h1 style="margin:0;font-size:26px;letter-spacing:0.5px;">Chronobox</h1>
              <p style="margin:6px 0 0;font-size:14px;opacity:0.9;">Hai conservato un ricordo 💛</p>
            </td>
          </tr>
          <tr>
            <td style="padding:26px;">
              <h2 style="margin:0 0 8px;font-size:20px;">🚀 Ciao ${customerName}!</h2>
              <p style="margin:0 0 14px;font-size:15px;color:#333;">Ordine avvenuto con successo, ora fai parte di Chronobox!</p>

              <div style="background:#fff4e8;border:1px solid #ffd9b8;padding:10px 12px;border-radius:10px;margin:14px 0;">
                <p style="margin:0;font-size:14px;"><b>Numero ordine:</b> #${id}</p>
              </div>

              <h3 style="margin:18px 0 8px;font-size:16px;color:#6b3f2a;">I TUOI DATI</h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;color:#222;">
                <tr>
                  <td style="padding:6px 0;"><b>Nome</b></td>
                  <td style="padding:6px 0;">${customerName}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;"><b>Email</b></td>
                  <td style="padding:6px 0;">${customerEmail}</td>
                </tr>
              </table>

              <h3 style="margin:18px 0 8px;font-size:16px;color:#6b3f2a;">DETTAGLI CAPSULA</h3>
              ${capsulesHtml}

              <h3 style="margin:18px 0 8px;font-size:16px;color:#6b3f2a;">RIEPILOGO PRODOTTI</h3>
              <div style="background:#fafafa;border:1px solid #eee;border-radius:12px;padding:10px;">
                ${itemsHtml}
              </div>

              <div style="margin-top:16px;background:#6b3f2a;color:#fff;padding:12px 14px;border-radius:10px;text-align:center;">
                <span style="font-size:14px;opacity:0.9;">${shippingLabel}</span><br/>
                <span style="font-size:15px;opacity:0.9;">Totale ordine</span><br/>
                <span style="font-size:20px;font-weight:700;">€${grandTotal.toFixed(
      2
    )}</span>
              </div>

              <p style="margin-top:18px;font-size:15px;">Grazie dal team di Chronobox!</p>
            </td>
          </tr>
          <tr>
            <td style="background:#fff4e8;padding:14px 18px;text-align:center;font-size:12px;color:#555;">
              Chronobox • Questo messaggio è stato inviato automaticamente
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</div>
`,
    attachments,
  };

  // ============================
  // MAIL ADMIN
  // ============================
  const adminMail = {
    from: process.env.SMTP_USER,
    to: process.env.ADMIN_EMAIL || "chronobox25@gmail.com",
    subject: `📦 NUOVO ORDINE RICEVUTO #${id}`,
    text: `NUOVO ORDINE RICEVUTO 🚀

Numero ordine: #${id}

CLIENTE:
Nome: ${customerName}
Email: ${customerEmail}

Indirizzo di spedizione:
${billingAddress || "—"}

DETTAGLI CAPSULA:
${capsulesText}

ARTICOLI ACQUISTATI:
${itemsText}

${shippingLabel.toUpperCase()}
TOTALE ORDINE: €${grandTotal.toFixed(2)}
`,
    html: `
<div style="margin:0;padding:0;background:#f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:20px 0;background:#f3f4f6;font-family:Arial,sans-serif;">
    <tr>
      <td align="center">
        <table width="680" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 6px 18px rgba(0,0,0,0.08);color:#111;">
          
          <tr>
            <td style="background:#111827;color:#fff;padding:18px 22px;text-align:center;">
              <h2 style="margin:0;font-size:20px;">NUOVO ORDINE RICEVUTO 🚀</h2>
              <p style="margin:6px 0 0;font-size:13px;opacity:.9;">Ordine #${id}</p>
            </td>
          </tr>

          <tr>
            <td style="padding:22px;">
              
              <div style="background:#f9fafb;border:1px solid #e5e7eb;padding:12px;border-radius:10px;margin-bottom:14px;">
                <p style="margin:0;font-size:14px;"><b>Numero ordine:</b> #${id}</p>
              </div>

              <h3 style="margin:16px 0 8px;font-size:15px;">Cliente</h3>
              <p style="margin:0;font-size:14px;"><b>Nome:</b> ${customerName}</p>
              <p style="margin:6px 0 0;font-size:14px;"><b>Email:</b> ${customerEmail}</p>

              <h3 style="margin:16px 0 8px;font-size:15px;">Indirizzo di spedizione</h3>
              <p style="margin:0;font-size:14px;">${billingAddress || "—"}</p>

              <h3 style="margin:16px 0 8px;font-size:15px;">Dettagli capsula</h3>
              ${capsulesHtml}

              <h3 style="margin:16px 0 8px;font-size:15px;">Articoli acquistati</h3>
              <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:12px;">
                ${itemsHtml}
              </div>

              <div style="margin-top:16px;background:#111827;color:#fff;padding:12px;border-radius:10px;text-align:center;">
                <div style="font-size:14px;margin-bottom:4px;">${shippingLabel}</div>
                <b style="font-size:16px;">Totale ordine: €${grandTotal.toFixed(2)}</b>
              </div>

            </td>
          </tr>

          <tr>
            <td style="background:#f9fafb;padding:12px;text-align:center;font-size:12px;color:#6b7280;">
              Chronobox Admin • Notifica automatica
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</div>
`,
  };

  try {
    const r1 = await transporter.sendMail(customerMail);
    const r2 = await transporter.sendMail(adminMail);
    console.log(
      ` Email cliente + admin inviate per ordine ${id}`,
      r1.messageId,
      r2.messageId
    );
  } catch (err) {
    console.error(" sendOrderEmails errore:", err.message);
    throw err;
  }
}

module.exports = { sendOrderEmails };
