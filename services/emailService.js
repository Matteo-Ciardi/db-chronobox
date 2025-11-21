const transporter = require("../middlewares/mailer");

function formatItems(items = []) {
  if (!Array.isArray(items) || items.length === 0) return "Nessun articolo";

  return items
    .map(i => {
      const qty = i.quantity ?? i.qty ?? 1;
      const price = i.price ?? i.unit_price ?? "";
      return `- ${i.name} x${qty}${price !== "" ? ` (€${price})` : ""}`;
    })
    .join("\n");
}

async function sendOrderEmails(order) {
  console.log(">>> sendOrderEmails chiamata", order.id)
  const {
    id,
    customerName,
    customerEmail,
    shippingAddress,
    items
  } = order;

  const itemsText = formatItems(items);

  // EMAIL AL CLIENTE
  const customerMail = {
    from: process.env.EMAIL_FROM,
    to: customerEmail,
    subject: `Chronobox - Ordine #${id} ricevuto`,
    text:
`Ciao ${customerName}!

Abbiamo ricevuto il tuo ordine #${id}.

Indirizzo di spedizione:
${shippingAddress}

Articoli:
${itemsText}

Grazie per aver scelto Chronobox!
`
  };

  // EMAIL ALL'ADMIN
  const adminMail = {
    from: process.env.EMAIL_FROM,
    to: process.env.ADMIN_EMAIL,
    subject: `Nuovo ordine Chronobox #${id}`,
    text:
`Nuovo ordine ricevuto!

ID ordine: ${id}
Cliente: ${customerName} (${customerEmail})
Spedizione: ${shippingAddress}

Articoli:
${itemsText}
`
  };

  // invia entrambe
  await Promise.all([
    transporter.sendMail(customerMail),
    transporter.sendMail(adminMail),
  ]);

  console.log(`✅ Email ordine ${id} inviate (cliente + admin)`);
}

module.exports = { sendOrderEmails };
