/************
    IMPORT
************/
console.log(">>> APP.JS NUOVO CARICATO");

const nodemailer = require("nodemailer");
const express = require('express');
const cors = require('cors');
const imagePath = require('./middlewares/imagePath');
const braintreeRouter = require("./routers/braintreeRouter");

// Import dei router
const capsulesRouter = require('./routers/capsulesRouter');
const ordersRouter = require('./routers/ordersRouter');
const paymentMethodsRouter = require('./routers/paymentMethodsRouter.js');


/***************************
    CONFIGURAZIONE EXPRESS
****************************/
const app = express();
const port = process.env.PORT || 3000;


/***************************
    SMTP TRANSPORTER (GMAIL)
****************************/
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS, // app password 16 caratteri
  },
  connectionTimeout: 8000,
  greetingTimeout: 8000,
  socketTimeout: 8000,
});

// verifica SMTP a boot
transporter.verify((err) => {
  if (err) {
    console.error("SMTP KO ❌:", err.message);
  } else {
    console.log("SMTP ready ✅");
  }
});


/***************
    MIDDLEWARE
****************/
app.use(cors({ origin: process.env.FE_APP || "*" }));
app.use(express.json());
app.use(imagePath);
app.use(express.static('public'));

// ✅ LOG GLOBALE: stampa OGNI richiesta che arriva
app.use((req, res, next) => {
  console.log(">>> ARRIVA:", req.method, req.originalUrl);
  next();
});


/********************
    ROUTERS API
*********************/
app.use('/api/capsules', capsulesRouter);
app.use('/api/checkout/orders', ordersRouter);
app.use('/api/checkout/payment-methods', paymentMethodsRouter);

app.use("/api/braintree", braintreeRouter);


/********************
    TEST EMAIL ROUTE
*********************/
app.get("/api/test-mail", async (req, res) => {
  console.log(">>> /api/test-mail chiamata");

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_USER,      // ✅ da gmail vera (meno filtri)
      to: process.env.ADMIN_EMAIL,
      subject: "Test Chronobox",
      text: "Se leggi questo, Nodemailer funziona 🎉",
    });

    console.log(">>> mail inviata");
    res.json({ ok: true, messageId: info.messageId });
  } catch (err) {
    console.error(">>> errore mail:", err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});


/*********************
    AVVIO SERVER
*********************/
app.listen(port, () => {
  console.log("Server in ascolto sulla porta " + port);
});
