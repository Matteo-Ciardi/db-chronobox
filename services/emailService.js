const transporter = require("../middlewares/mailer");

function formatItems(items = []) {
  if (!Array.isArray(items) || items.length === 0) return "Nessun articolo";
  return items
    .map(i => `- ${i.name} x${i.quantity ?? 1} (€${i.price ?? ""})`)
    .join("\n");
}

async function sendOrderEmails(order) {
  console.log(">>> sendOrderEmails chiamata", order.id);

  const {
    id,
    customerName,
    customerEmail,
    shippingAddress,
    items
  } = order;

  const itemsText = formatItems(items);

  // mail al cliente
  const customerMail = {
    from: process.env.SMTP_USER,
    to: customerEmail,
    subject: `Chronobox - Ordine #${id} ricevuto`,
    text:
`Ciao ${customerName}!

Abbiamo ricevuto il tuo ordine #${id}.

Spedizione:
${shippingAddress}

Articoli:
${itemsText}

Grazie!
Chronobox`
  };

  // mail admin (a te)
  const adminMail = {
    from: process.env.SMTP_USER,
    to: "chronobox25@gmail.com",
    subject: `Nuovo ordine Chronobox #${id}`,
    text:
`NUOVO ORDINE RICEVUTO!

ID ordine: ${id}
Cliente: ${customerName} (${customerEmail})
Spedizione: ${shippingAddress}

Articoli:
${itemsText}`
  };

  try {
    console.log(">>> invio CUSTOMER mail a", customerEmail);
    const r1 = await transporter.sendMail(customerMail);
    console.log(">>> CUSTOMER mail inviata, id:", r1.messageId);

    console.log(">>> invio ADMIN mail a chronobox25@gmail.com");
    const r2 = await transporter.sendMail(adminMail);
    console.log(">>> ADMIN mail inviata, id:", r2.messageId);

    console.log(`✅ Email cliente + admin inviate per ordine ${id}`);
  } catch (err) {
    console.error("❌ sendOrderEmails errore:", err.message);
    throw err; // così il catch nel controller lo vede
  }
}

module.exports = { sendOrderEmails };
