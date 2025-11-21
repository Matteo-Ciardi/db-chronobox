/************
    IMPORT
************/
const nodemailer = require("nodemailer");
const express = require('express');
const cors = require('cors');
const imagePath = require('./middlewares/imagePath');

// Import dei router
const capsulesRouter = require('./routers/capsulesRouter');
const ordersRouter = require('./routers/ordersRouter');
const paymentMethodsRouter = require('./routers/paymentMethodsRouter.js');
const capsuleMostPopularRouter = require('./routers/capsuleMostPopularRouter.js');
const capsuleNewArrivalsRouter = require('./routers/capsuleNewArrivalsRouter.js');


/***************************
    CONFIGURAZIONE EXPRESS
****************************/
const app = express();
const port = process.env.PORT || 3000;


/***************************
    SMTP TRANSPORTER (GMAIL)
****************************/
const smtpPort = Number(process.env.SMTP_PORT);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS, // app password 16 caratteri
  },
  connectionTimeout: 8000, // 8 secondi
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


/********************
    ROUTERS API
*********************/
app.use('/api/capsules', capsulesRouter);
app.use('/api/capsule-most-popular', capsuleMostPopularRouter);
app.use('/api/capsule-new-arrivals', capsuleNewArrivalsRouter);

// Orders e Payment Methods sotto la stessa rotta "checkout"
app.use('/api/checkout/orders', ordersRouter);
app.use('/api/checkout/payment-methods', paymentMethodsRouter);


/********************
    TEST EMAIL ROUTE
*********************/
app.get("/api/test-mail", async (req, res) => {
  console.log(">>> /api/test-mail chiamata");  // 1) entra qui

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.ADMIN_EMAIL,
      subject: "Test Chronobox",
      text: "Se leggi questo, Nodemailer funziona 🎉",
    });

    console.log(">>> mail inviata");           // 2) arriva qui solo se Gmail risponde

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
