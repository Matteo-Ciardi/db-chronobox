/************
    IMPORT
************/
const connection = require('../data/connection');

/********************
    CONTROLLER FUNZIONI
*********************/

// index - Mostra tutti i temi
async function index(req, res) {
    try {
        const [rows] = await connection.query('SELECT * FROM theme');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// show - Mostra un tema specifico
async function show(req, res) {
    try {
        const [rows] = await connection.query(
            'SELECT * FROM theme WHERE id = ?',
            [req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Theme not found' });
        }

        res.json(rows[0]);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// store - Crea un nuovo tema
async function store(req, res) {
    try {
        const { name, description, image } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Name is required' });
        }

        const [result] = await connection.query(
            'INSERT INTO theme (name, description, image) VALUES (?, ?, ?)',
            [name, description, image]
        );

        res.status(201).json({
            id: result.insertId,
            message: 'Theme created successfully'
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// update - Aggiorna un tema
async function update(req, res) {
    try {
        const { name, description, image } = req.body;

        const [result] = await connection.query(
            'UPDATE theme SET name = ?, description = ?, image = ? WHERE id = ?',
            [name, description, image, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Theme not found' });
        }

        res.json({ message: 'Theme updated successfully' });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// destroy - Elimina un tema
async function destroy(req, res) {
    try {
        const [result] = await connection.query(
            'DELETE FROM theme WHERE id = ?',
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Theme not found' });
        }

        res.json({ message: 'Theme deleted successfully' });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}


/************
    EXPORT
************/
module.exports = { index, show, store, update, destroy };