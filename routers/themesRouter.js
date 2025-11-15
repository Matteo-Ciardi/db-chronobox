/************
    IMPORT
************/
const express = require('express')                                  // Import Express
const themeController = require('../controllers/themeController')   // Import Controller dei temi

/*************
    ROUTER
*************/
const router = express.Router()                   // Inizializzazione router express

// Definizione delle rotte CRUD
router.get('/', themeController.index);           // Mostra tutte i temi
router.get('/:id', themeController.show);         // Mostra un tema specifico
router.post('/', themeController.store);          // Crea un nuovo tema
router.put('/:id', themeController.update);       // Aggiorna un tema
router.delete('/:id', themeController.destroy);   // Elimina un tema

/************
    EXPORT
************/
module.exports = router; // Export del router