/************
    IMPORT
************/
const connection = require('../data/connection');

/********************
    FUNZIONI ROTTE
*********************/

// index - Mostra tutte le relazioni capsule-order
async function index(req, res) {
    try {
        const [rows] = await connection.query('SELECT * FROM capsule_order');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// show - Mostra una relazione capsule-order specifica
// (order_id + capsule_id = primary key)
async function show(req, res) {
    try {
        const { order_id, capsule_id } = req.params;

        const [rows] = await connection.query(
            `SELECT * FROM capsule_order 
             WHERE order_id = ? AND capsule_id = ?`,
            [order_id, capsule_id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Relation not found' });
        }

        res.json(rows[0]);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// store - Crea una nuova relazione capsule-order
async function store(req, res) {
    try {
        const {
            order_id,
            capsule_id,
            quantity,
            unit_price,
            shipping_period,
            letter_content,
            discounted_price
        } = req.body;

        const [result] = await connection.query(
            `INSERT INTO capsule_order 
             (order_id, capsule_id, quantity, unit_price, shipping_period, letter_content, discounted_price)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                order_id,
                capsule_id,
                quantity,
                unit_price,
                shipping_period,
                letter_content,
                discounted_price
            ]
        );

        res.status(201).json({
            message: 'Relation created successfully'
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// update - Aggiorna una relazione esistente
async function update(req, res) {
    try {
        const { order_id, capsule_id } = req.params;
        const {
            quantity,
            unit_price,
            shipping_period,
            letter_content,
            discounted_price
        } = req.body;

        const [result] = await connection.query(
            `UPDATE capsule_order 
             SET quantity = ?, unit_price = ?, shipping_period = ?, letter_content = ?, discounted_price = ?
             WHERE order_id = ? AND capsule_id = ?`,
            [
                quantity,
                unit_price,
                shipping_period,
                letter_content,
                discounted_price,
                order_id,
                capsule_id
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Relation not found' });
        }

        res.json({ message: 'Relation updated successfully' });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// destroy - Elimina una relazione capsule-order
async function destroy(req, res) {
    try {
        const { order_id, capsule_id } = req.params;

        const [result] = await connection.query(
            `DELETE FROM capsule_order 
             WHERE order_id = ? AND capsule_id = ?`,
            [order_id, capsule_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Relation not found' });
        }

        res.json({ message: 'Relation deleted successfully' });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

/************
    EXPORT
************/
module.exports = { index, show, store, update, destroy };