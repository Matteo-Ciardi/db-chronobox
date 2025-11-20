/************
    IMPORT
************/
const express = require('express')                          // Import del modulo Express
const cors = require('cors');                               // Import del middleware cors
const imagePath = require('./middlewares/imagePath');       // Import del middleware imagePath


// Import dei router
const capsulesRouter = require('./routers/capsulesRouter');
const ordersRouter = require('./routers/ordersRouter');
const paymentMethodsRouter = require('./routers/paymentMethodsRouter.js');
const capsuleMostPopularRouter = require('./routers/capsuleMostPopularRouter.js');
const capsuleNewArrivalsRouter = require('./routers/capsuleNewArrivalsRouter.js');


/***************************
    CONFIGURAZIONE EXPRESS
****************************/
const app = express();                      // Inizializzazione dell'app Express
const port = 3000;                          // Definizione della porta su cui il server deve rimanere in ascolto


/***************
    MIDDLEWARE
****************/
app.use(cors({ origin: process.env.FE_APP }))       // Registrazione middleware cors per gestire le richieste tra origini diverse
app.use(express.json());                            // Registrazione middleware per parsing JSON
app.use(imagePath);                                 // Registrazione middleware per gestire dinamicamente il path delle immagini
app.use(express.static('public'));                  // Registrazione middleware per servire i file statici

// Registrazione dei router
app.use('/api/capsules', capsulesRouter);
// app.use('/api/capsules/most-popular', capsuleMostPopularRouter);         DA SISTEMARE COSI'
// app.use('/api/capsules/new-arrivals', capsuleNewArrivalsRouter);         DA SISTEMARE COSI'
app.use('/api/capsule-most-popular', capsuleMostPopularRouter);
app.use('/api/capsule-new-arrivals', capsuleNewArrivalsRouter);

// Orders e Payment Methods sotto la stessa rotta "checkout"
app.use('/api/checkout/orders', ordersRouter);
app.use('/api/checkout/payment-methods', paymentMethodsRouter);

/*********************
    AVVIO SERVER
*********************/
// Il server viene messo in ascolto sulla porta 3000
app.listen(port, () => {
    console.log("Server in ascolto sulla porta " + port);
})