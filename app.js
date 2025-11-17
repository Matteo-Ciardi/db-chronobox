/************
    IMPORT
************/
const express = require('express')          // Import del modulo Express

// Import dei router
const capsulesRouter = require('./routers/capsulesRouter');
const themesRouter = require('./routers/themesRouter');
const ordersRouter = require('./routers/ordersRouter');
const paymentMethodsRouter = require('./routers/paymentMethodsRouter.js');


/***************************
    CONFIGURAZIONE EXPRESS
****************************/
const app = express();                      // Inizializzazione dell'app Express
const port = 3000;                          // Definizione della porta su cui il server deve rimanere in ascolto


/***************
    MIDDLEWARE
****************/

// Middleware per parsing JSON
app.use(express.json());

// Registrazione dei router
app.use('/api/capsules', capsulesRouter);
app.use('/api/themes', themesRouter);      
app.use('/api/orders', ordersRouter);      
app.use('/api/payment-methods', paymentMethodsRouter); 


/*********************
    AVVIO SERVER
*********************/
// Il server viene messo in ascolto sulla porta 3000
app.listen(port, () => {
    console.log("Server in ascolto sulla porta " + port);
})