/************
    IMPORT
************/


/********************
    FUNZIONI ROTTE
*********************/

// index - Mostra tutti i metodi di pagamento
function index(req, res) {
    res.send("Lista metodi di pagamento");
}

// show - Mostra un metodo di pagamento specifico
function show(req, res) {
    res.send("Dettagli metodo di pagamento " + req.params.id);
}

// store - Crea un nuovo metodo di pagamento
function store(req, res) {
    res.send("Creato nuovo metodo di pagamento");
}

// update - Aggiorna un metodo di pagamento
function update(req, res) {
    res.send("Aggiornato metodo di pagamento " + req.params.id);
}

// destroy - Elimina un metodo di pagamento
function destroy(req, res) {
    res.send("Eliminato metodo di pagamento " + req.params.id);
}


/************
    EXPORT
************/
module.exports = { index, show, store, update, destroy };  // Export funzioni controller