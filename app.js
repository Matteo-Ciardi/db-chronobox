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
const capsuleOrdersRouter = require('./routers/capsuleOrdersRouter.js');
const capsuleOrderImagesRouter = require('./routers/capsuleOrderImagesRouter.js');
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
app.use('/api/orders', ordersRouter);      
app.use('/api/payment-methods', paymentMethodsRouter); 
app.use('/api/capsule-orders', capsuleOrdersRouter);
app.use('/api/capsule-order-images', capsuleOrderImagesRouter);
app.use('/api/capsule-most-popular', capsuleMostPopularRouter);
app.use('/api/capsule-new-arrivals', capsuleNewArrivalsRouter);


/*********************
    AVVIO SERVER
*********************/
// Il server viene messo in ascolto sulla porta 3000
app.listen(port, () => {
    console.log("Server in ascolto sulla porta " + port);
})