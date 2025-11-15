/************
    IMPORT
************/


/********************
    FUNZIONI ROTTE
*********************/

// index - Mostra tutte i temi
function index(req, res) {
    res.send("Lista temi");
}

// show - Mostra un tema specifico
function show(req, res) {
    res.send("Dettagli tema " + req.params.id);
}

// store - Crea un nuovo tema
function store(req, res) {
    res.send("Creato nuovo tema");
}

// update - Aggiorna un tema
function update(req, res) {
    res.send("Aggiornato tema " + req.params.id);
}

// destroy - Elimina un tema
function destroy(req, res) {
    res.send("Eliminato tema " + req.params.id);
}


/************
    EXPORT
************/
module.exports = { index, show, store, update, destroy };  // Export funzioni controller