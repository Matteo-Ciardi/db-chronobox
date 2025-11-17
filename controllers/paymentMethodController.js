/************
    IMPORT
************/
const connection = require('../data/connection');

/********************
    CONTROLLER FUNZIONI
*********************/

// index - Mostra tutti i metodi di pagamento
async function index(req, res) {
    try {
        const [rows] = await connection.query('SELECT * FROM payment_method');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// show - Mostra un metodo di pagamento specifico
async function show(req, res) {
    try {
        const [rows] = await connection.query(
            'SELECT * FROM payment_method WHERE id = ?',
            [req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Payment method not found' });
        }

        res.json(rows[0]);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// store - Crea un nuovo metodo di pagamento
async function store(req, res) {
    try {
        const { name, provider, type, logo_url, description, active } = req.body;

        if (!name || !provider || !type) {
            return res.status(400).json({
                error: 'Fields "name", "provider", and "type" are required'
            });
        }

        const [result] = await connection.query(
            `INSERT INTO payment_method 
                (name, provider, type, logo_url, description, active)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [name, provider, type, logo_url, description, active ?? 1]
        );

        res.status(201).json({
            id: result.insertId,
            message: 'Payment method created successfully'
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// update - Aggiorna un metodo di pagamento
async function update(req, res) {
    try {
        const { name, provider, type, logo_url, description, active } = req.body;

        const [result] = await connection.query(
            `UPDATE payment_method
             SET name = ?, provider = ?, type = ?, logo_url = ?, description = ?, active = ?
             WHERE id = ?`,
            [name, provider, type, logo_url, description, active, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Payment method not found' });
        }

        res.json({ message: 'Payment method updated successfully' });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// destroy - Elimina un metodo di pagamento
async function destroy(req, res) {
    try {
        const [result] = await connection.query(
            'DELETE FROM payment_method WHERE id = ?',
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Payment method not found' });
        }

        res.json({ message: 'Payment method deleted successfully' });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}


/************
    EXPORT
************/
module.exports = { index, show, store, update, destroy };