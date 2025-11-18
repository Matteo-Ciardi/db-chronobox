/************
    IMPORT
************/
const express = require('express')                                                            // Import Express
const capsuleMostPopularController = require('../controllers/capsuleMostPopularController')   // Import Controller delle capsule più popolari

/*************
    ROUTER
*************/
const router = express.Router() // Inizializzazione router express

// Definizione delle rotte CRUD
router.get('/', capsuleMostPopularController.index);                       // Mostra tutte le capsule più popolari
router.get('/:id', capsuleMostPopularController.show);                     // Mostra una capsula popolare specifica

/************
    EXPORT
************/
module.exports = router; // Export del router