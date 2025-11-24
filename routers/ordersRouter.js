const { sendOrderEmails } = require("../services/emailService");


/************
    IMPORT
************/
const express = require('express')                                  // Import Express
const orderController = require('../controllers/orderController')   // Import Controller degli ordini

/*************
    ROUTER
*************/
const router = express.Router()                   // Inizializzazione router express

// Definizione delle rotte CRUD
router.get('/', orderController.index);           // Mostra tutte gli ordini
router.get('/:id', orderController.show);         // Mostra un ordine specifico
router.post('/', orderController.store);          // Crea un nuovo ordine
router.put('/:id', orderController.update);       // Aggiorna un ordine
router.delete('/:id', orderController.destroy);   // Elimina un ordine

/************
    EXPORT
************/
module.exports = router; // Export del router