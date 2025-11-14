/************
    IMPORT
************/
const express = require('express')                                      // Import Express
const capsuleController = require('../controllers/capsuleController')   // Import Controller delle capsule

/*************
    ROUTER
*************/
const router = express.Router() // Inizializzazione router express

// Definizione delle rotte CRUD
router.get('/', capsuleController.index);                       // Mostra tutte le capsule
router.get('/:id', capsuleController.showCapsule);              // Mostra una capsula specifica
router.get('/:id/related', capsuleController.showRelated);      // Mostra i prodotti correlati di una capsula
router.post('/', capsuleController.store);                      // Crea una nuova capsula
router.put('/:id', capsuleController.update);                   // Aggiorna una capsula
router.delete('/:id', capsuleController.destroy);               // Elimina una capsula

/************
    EXPORT
************/
module.exports = router; // Export del router