/************
    IMPORT
************/
const connection = require('../data/connection');

/********************
    FUNZIONI ROTTE
*********************/

// index - Mostra tutte le relazioni capsule-order-images
async function index(req, res) {
    try {
        const [rows] = await connection.query('SELECT * FROM capsule_order_images');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// show - Mostra una relazione capsule-order-images specifica
async function show(req, res) {
    try {
        const [rows] = await connection.query(
            'SELECT * FROM capsule_order_images WHERE id = ?',
            [req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Relation not found' });
        }

        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// store - Crea una nuova relazione capsule-order-images
async function store(req, res) {
    try {
        const { order_id, capsule_id, file_path, original_filename } = req.body;

        const [result] = await connection.query(
            `INSERT INTO capsule_order_images (order_id, capsule_id, file_path, original_filename)
             VALUES (?, ?, ?, ?)`,
            [order_id, capsule_id, file_path, original_filename]
        );

        res.status(201).json({
            id: result.insertId,
            message: 'Image relation created successfully'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// update - Aggiorna una relazione capsule-order-images
async function update(req, res) {
    try {
        const { order_id, capsule_id, file_path, original_filename } = req.body;

        const [result] = await connection.query(
            `UPDATE capsule_order_images 
             SET order_id = ?, capsule_id = ?, file_path = ?, original_filename = ?
             WHERE id = ?`,
            [order_id, capsule_id, file_path, original_filename, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Relation not found' });
        }

        res.json({ message: 'Image relation updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// destroy - Elimina una relazione capsule-order-images
async function destroy(req, res) {
    try {
        const [result] = await connection.query(
            'DELETE FROM capsule_order_images WHERE id = ?',
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Relation not found' });
        }

        res.json({ message: 'Image relation deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

/************
    EXPORT
************/
module.exports = { index, show, store, update, destroy };
