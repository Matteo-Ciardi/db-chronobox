/************
    IMPORT
************/
const express = require('express')                                                            // Import Express
const capsuleNewArrivalsController = require('../controllers/capsuleNewArrivalsController')   // Import Controller capsule (nuove)

/*************
    ROUTER
*************/
const router = express.Router() // Inizializzazione router express

// Definizione delle rotte CRUD
router.get('/', capsuleNewArrivalsController.index);                       // Mostra tutte le nuove capsule
router.get('/:id', capsuleNewArrivalsController.show);                     // Mostra una nuova capsula specifica

/************
    EXPORT
************/
module.exports = router; // Export del router