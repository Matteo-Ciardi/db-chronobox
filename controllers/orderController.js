/************
    IMPORT
************/


/********************
    FUNZIONI ROTTE
*********************/

// index - Mostra tutti gli ordini
function index(req, res) {
    res.send("Lista ordini");
}

// show - Mostra un ordine specifico
function show(req, res) {
    res.send("Dettagli ordine " + req.params.id);
}

// store - Crea un ordine
function store(req, res) {
    res.send("Creato nuovo ordine");
}

// update - Aggiorna un ordine
function update(req, res) {
    res.send("Aggiornato ordine " + req.params.id);
}

// destroy - Elimina un ordine
function destroy(req, res) {
    res.send("Eliminato ordine " + req.params.id);
}


/************
    EXPORT
************/
module.exports = { index, show, store, update, destroy };  // Export funzioni controller