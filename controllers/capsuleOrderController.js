/************
    IMPORT
************/


/********************
    FUNZIONI ROTTE
*********************/

// index - Mostra tutte le relazioni capsule-order
function index(req, res) {
    res.send("Lista relazioni capsule-order");
}

// show - Mostra una relazione capsule-order specifica
function show(req, res) {
    res.send("Dettagli relazione capsule-order: " + req.params.id);
}

// store -  Crea una nuova relazione capsule-order (associa una capsula a un ordine)
function store(req, res) {
    res.send("Creata nuova relazione capsule-order");
}

// update - Aggiorna una relazione capsule-order esistente
function update(req, res) {
    res.send("Aggiornata relazione capsule-order " + req.params.id);
}

// destroy - Elimina una relazione capsule-order
function destroy(req, res) {
    res.send("Eliminata relazione capsule-order " + req.params.id);
}


/************
    EXPORT
************/
module.exports = { index, show, store, update, destroy };  // Export funzioni controller