/************
     IMPORT
 ************/
const connection = require('../data/connection');


/********************
    FUNZIONI ROTTE
*********************/

// index - Mostra tutti gli ordini
async function index(req, res) {
    try {
        const [rows] = await connection.query('SELECT * FROM orders');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// show - Mostra un ordine specifico
async function show(req, res) {
    try {
        const [rows] = await connection.query('SELECT * FROM orders WHERE id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// store - Crea un ordine
async function store(req, res) {
    try {
        const { method_id, session_id, customer_name, customer_email, shipping_address, billing_address, total } = req.body;
        const [result] = await connection.query('INSERT INTO orders (method_id, session_id, customer_name, customer_email, shipping_address, billing_address, total) VALUES (?, ?, ?, ?, ?, ?, ?)', [method_id, session_id, customer_name, customer_email, shipping_address, billing_address, total]);
        res.status(201).json({ id: result.insertId, message: 'Order created successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// update - Aggiorna un ordine
async function update(req, res) {
    try {
        const { method_id, session_id, customer_name, customer_email, shipping_address, billing_address, total, status } = req.body;
        const [result] = await connection.query('UPDATE orders SET method_id = ?, session_id = ?, customer_name = ?, customer_email = ?, shipping_address = ?, billing_address = ?, total = ?, status = ? WHERE id = ?', [method_id, session_id, customer_name, customer_email, shipping_address, billing_address, total, status, req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.json({ message: 'Order updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// destroy - Elimina un ordine
async function destroy(req, res) {
    try {
        const [result] = await connection.query('DELETE FROM orders WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.json({ message: 'Order deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}


/************
    EXPORT
************/
module.exports = { index, show, store, update, destroy };  // Export funzioni controller