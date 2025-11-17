/************
     IMPORT
 ************/
const connection = require('../data/connection');


/********************
    FUNZIONI ROTTE
*********************/

// index - Mostra tutte le capsule
async function index(req, res) {
    try {
        const [rows] = await connection.query('SELECT * FROM capsules');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// ShowCapsule - Mostra una capsula specifica
async function showCapsule(req, res) {
    try {
        const [rows] = await connection.query('SELECT * FROM capsules WHERE id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Capsule not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// showRelated - Mostra i prodotti correlati di una capsula (capsule dello stesso tema)
async function showRelated(req, res) {
    try {
        const [capsule] = await connection.query('SELECT theme_id FROM capsules WHERE id = ?', [req.params.id]);
        if (capsule.length === 0) {
            return res.status(404).json({ error: 'Capsule not found' });
        }
        const [rows] = await connection.query('SELECT * FROM capsules WHERE theme_id = ? AND id != ?', [capsule[0].theme_id, req.params.id]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// store - Crea una nuova capsula
async function store(req, res) {
    try {
        const { name, description, price, theme_id } = req.body;
        const [result] = await connection.query('INSERT INTO capsules (name, description, price, theme_id) VALUES (?, ?, ?, ?)', [name, description, price, theme_id]);
        res.status(201).json({ id: result.insertId, message: 'Capsule created successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// update - Aggiorna una capsula
async function update(req, res) {
    try {
        const { name, description, price, theme_id } = req.body;
        const [result] = await connection.query('UPDATE capsules SET name = ?, description = ?, price = ?, theme_id = ? WHERE id = ?', [name, description, price, theme_id, req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Capsule not found' });
        }
        res.json({ message: 'Capsule updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// destroy - Elimina una capsula
async function destroy(req, res) {
    try {
        const [result] = await connection.query('DELETE FROM capsules WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Capsule not found' });
        }
        res.json({ message: 'Capsule deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}


/************
    EXPORT
************/
module.exports = { index, showCapsule, showRelated, store, update, destroy };  // Export funzioni controller