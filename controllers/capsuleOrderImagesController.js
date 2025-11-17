/************
    IMPORT
************/


/********************
    FUNZIONI ROTTE
*********************/

// index - Mostra tutte le relazioni capsule-order-images
function index(req, res) {
    res.send("Lista relazioni capsule-order-images");
}

// show - Mostra una relazione capsule-order-images specifica
function show(req, res) {
    res.send("Dettagli relazione capsule-order-images: " + req.params.id);
}

// store -  Crea una nuova relazione capsule-order-images (associa una capsula a un ordine)
function store(req, res) {
    res.send("Creata nuova relazione capsule-order-images");
}

// update - Aggiorna una relazione capsule-order-images esistente
function update(req, res) {
    res.send("Aggiornata relazione capsule-order-images: " + req.params.id);
}

// destroy - Elimina una relazione capsule-order-images
function destroy(req, res) {
    res.send("Eliminata relazione capsule-order-images: " + req.params.id);
}


/************
    EXPORT
************/
module.exports = { index, show, store, update, destroy };  // Export funzioni controller