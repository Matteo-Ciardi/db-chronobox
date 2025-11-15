/************
    IMPORT
************/
const express = require('express')                                                  // Import Express
const paymentMethodController = require('../controllers/paymentMethodController')   // Import Controller dei metodi di pagamento

/*************
    ROUTER
*************/
const router = express.Router()                           // Inizializzazione router express

// Definizione delle rotte CRUD
router.get('/', paymentMethodController.index);           // Mostra tutti i metodi di pagamento
router.get('/:id', paymentMethodController.show);         // Mostra un metodo di pagamento specifico
router.post('/', paymentMethodController.store);          // Crea un metodo di pagamento
router.put('/:id', paymentMethodController.update);       // Aggiorna metodo di pagamento
router.delete('/:id', paymentMethodController.destroy);   // Elimina un metodo di pagamento

/************
    EXPORT
************/
module.exports = router; // Export del router