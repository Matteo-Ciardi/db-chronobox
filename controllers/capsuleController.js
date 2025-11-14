/************
    IMPORT
************/


/********************
    FUNZIONI ROTTE
*********************/

// index - Mostra tutte le capsule
function index(req, res) {
    res.send("Lista delle capsule");
}

// ShowCapsule - Mostra una capsula specifica
function showCapsule(req, res) {
    res.send("Dettagli capsula " + req.params.id);
}

// showRelated - Mostra i prodotti correlati di una capsula (capsule di diverso colore)
function showRelated(req, res) {
    res.send("Capsule correlate per capsula " + req.params.id);
}

// store - Crea una nuova capsula
function store(req, res) {
    res.send("Creata nuova capsula");
}

// update - Aggiorna una capsula
function update(req, res) {
    res.send("Aggiornata capsula " + req.params.id);
}

// destroy - Elimina una capsula
function destroy(req, res) {
    res.send("Eliminata capsula " + req.params.id);
}


/************
    EXPORT
************/
module.exports = { index, showCapsule, showRelated, store, update, destroy };  // Export funzioni controller