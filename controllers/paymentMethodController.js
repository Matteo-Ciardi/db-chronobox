/************
    IMPORT
************/
const connection = require('../data/connection');
const { validatePaymentMethod } = require("../validations/paymentMethodValidation");


/***********************
    CONTROLLER FUNZIONI
************************/

// --------------------------------------------------- INDEX ----------------------------------------------------

// index - Mostra tutti i metodi di pagamento
async function index(req, res) {

    // Definizione query
    const query_payment_methods = `
        SELECT *
        FROM payment_method
    `;

    try {

        // Esecuzione query: recupero tutti i metodi di pagamento
        const [rows] = await connection.query(query_payment_methods); 

        // Restituisco tutti i metodi di pagamento in formato JSON
        res.json(rows);
    } 
    
    // Gestione errori
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// --------------------------------------------------- SHOW ----------------------------------------------------

// show - Mostra un metodo di pagamento specifico
async function show(req, res) {

    // Recupero id dall'URL
    const id = parseInt(req.params.id);

    // Definizione query
    const query_show_payment = `
        SELECT *
        FROM payment_method
        WHERE id = ?
    `;

    try {

        // Esecuzione query: recupero metodo di pagamento
        const [rows] = await connection.query(query_show_payment, [id]);

        // Se non esiste → errore 404
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Payment method not found' });
        }

        // Restituisco il metodo di pagamento in formato JSON
        res.json(rows[0]);

    } 
    
    // Gestione errori
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// --------------------------------------------------- STORE ----------------------------------------------------

// store - Crea un nuovo metodo di pagamento
async function store(req, res) {
    
    try {

        // Validazione input utente
        const validation = validatePaymentMethod(req.body, false); // STORE → campi obbligatori
        if (!validation.valid) {
            return res.status(400).json({ errors: validation.errors });
        }

        // Recupero dati dal body della richiesta
        const { name, provider, type, logo_url, description, active } = req.body;

        // Definizione query
        const query_store_payment =`
            INSERT INTO payment_method
                (name, provider, type, logo_url, description, active)
             VALUES (?, ?, ?, ?, ?, ?)
        `;
        
        // Esecuzione query: inserimento nuovo metodo di pagamento
        const [result] = await connection.query(
            query_store_payment,
            [
                name, 
                provider, 
                type, 
                logo_url, 
                description, 
                active ?? 1         // Se non arriva → default = 1
            ]
        );

        // Risposta in caso di successo
        res.status(201).json({
            id: result.insertId,
            message: 'Payment method created successfully'
        });

    } 
    
    // Gestione errori
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// --------------------------------------------------- UPDATE ----------------------------------------------------

// update - Aggiorna un metodo di pagamento
async function update(req, res) {

    // Recupero id dall'URL
    const id = parseInt(req.params.id);

    try {
        // Validazioni input utente
        const validation = validatePaymentMethod(req.body, true); // UPDATE → campi facoltativi
        if (!validation.valid) {
            return res.status(400).json({ errors: validation.errors });
        }
        
        // Recupero dati dal body della richiesta (tramite destructuring)
        const { name, provider, type, logo_url, description, active } = req.body;

        // Definizione query
        const query_update_payment = `
            UPDATE payment_method
            SET name = ?, provider = ?, type = ?, logo_url = ?, description = ?, active = ?
            WHERE id = ?
        `;

        // Esecuzione query: aggiorna un metodo di pagamento
        const [result] = await connection.query(
            query_update_payment,
            [
                name, 
                provider, 
                type, 
                logo_url, 
                description, 
                active, 
                id]
        );

        // Nessuna riga modificata → ID inesistente
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Payment method not found' });
        }

        // Risposta in caso di succcesso
        res.json({ message: 'Payment method updated successfully' });

    } 
    
    // Gestione errori
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}

//--------------------------------------------------- Destroy ----------------------------------------------------

// destroy - Elimina un metodo di pagamento
async function destroy(req, res) {

    // Recupero id dall'URL 
    const id = parseInt(req.params.id);

    try {

        // Definizione query
        const query_destroy_payment = `
            DELETE 
            FROM payment_method
            WHERE id = ?
        `;

        // Esecuzione query: elimina un metodo di pagamento
        const [result] = await connection.query(query_destroy_payment, [id]);

        // Nessuna riga eliminata → ID inesistente
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Payment method not found' });
        }

        // Risposta in caso di successo
        res.json({ message: 'Payment method deleted successfully' });

    } 
    
    // Gestione errori
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}


/************
    EXPORT
************/
module.exports = { index, show, store, update, destroy };