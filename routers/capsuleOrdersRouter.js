/************
    IMPORT
************/
const express = require('express')                                                  // Import Express
const capsuleOrderController = require('../controllers/capsuleOrderController')    // Import Controller capsuleOrder

/*************
    ROUTER
*************/
const router = express.Router()                           // Inizializzazione router express

// Definizione delle rotte CRUD
router.get('/', capsuleOrderController.index);           // Mostra tutte le relazioni capsule-order
router.get('/:id', capsuleOrderController.show);         // Mostra una relazione capsule-order specifica
router.post('/', capsuleOrderController.store);          // Crea una nuova relazione capsule-order(associa una capsula a un ordine)
router.put('/:id', capsuleOrderController.update);       // Aggiorna una relazione capsule-order esistente
router.delete('/:id', capsuleOrderController.destroy);   // Elimina una relazione capsule-order

/************
    EXPORT
************/
module.exports = router; // Export del router