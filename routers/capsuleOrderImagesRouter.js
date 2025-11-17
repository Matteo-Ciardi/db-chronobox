/************
    IMPORT
************/
const express = require('express')                                                  // Import Express
const capsuleOrderImagesController = require('../controllers/capsuleOrderImagesController')    // Import Controller capsuleOrderImages

/*************
    ROUTER
*************/
const router = express.Router()                           // Inizializzazione router express

// Definizione delle rotte CRUD
router.get('/', capsuleOrderImagesController.index);           // Mostra tutte le relazioni capsule-order-images
router.get('/:id', capsuleOrderImagesController.show);         // Mostra una relazione capsule-order-images specifica
router.post('/', capsuleOrderImagesController.store);          // Crea una nuova relazione capsule-order-images(associa una capsula a un ordine)
router.put('/:id', capsuleOrderImagesController.update);       // Aggiorna una relazione capsule-order-images esistente
router.delete('/:id', capsuleOrderImagesController.destroy);   // Elimina una relazione capsule-order-images

/************
    EXPORT
************/
module.exports = router; // Export del router