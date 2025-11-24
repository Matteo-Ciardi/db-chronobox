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
router.get('/most-populars', capsuleController.mostPopulars);   // Mostra le capsule più popolari
router.get('/new-arrivals', capsuleController.newArrivals);     // Mostra le nuove capsule
router.get('/:slug/related', capsuleController.related);        // Mostra capsule correlate
router.get('/:slug', capsuleController.show);                   // Mostra una capsula specifica
router.post('/', capsuleController.store);                      // Crea una nuova capsula
router.put('/:id', capsuleController.update);                   // Aggiorna una capsula
router.delete('/:id', capsuleController.destroy);               // Elimina una capsula


/************
    EXPORT
************/
module.exports = router; // Export del router