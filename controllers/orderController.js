/************
     IMPORT
 ************/
const connection = require('../data/connection');

/********************
    CONTROLLER FUNZIONI
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
        const [rows] = await connection.query(
            'SELECT * FROM orders WHERE id = ?',
            [req.params.id]
        );

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
        const {
            method_id,
            session_id,
            customer_name,
            customer_email,
            shipping_address,
            billing_address,
            total_amount,
            status // optional
        } = req.body;

        // Required fields validation
        if (!customer_name || !customer_email || !shipping_address || total_amount == null) {
            return res.status(400).json({
                error: 'Missing required fields (customer_name, customer_email, shipping_address, total_amount)'
            });
        }

        const [result] = await connection.query(
            `INSERT INTO orders 
                (method_id, session_id, customer_name, customer_email, shipping_address, billing_address, total_amount, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                method_id || null,
                session_id || null,
                customer_name,
                customer_email,
                shipping_address,
                billing_address || null,
                total_amount,
                status || 'pending'
            ]
        );

        res.status(201).json({
            id: result.insertId,
            message: 'Order created successfully'
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// update - Aggiorna un ordine
async function update(req, res) {
    try {
        const {
            method_id,
            session_id,
            customer_name,
            customer_email,
            shipping_address,
            billing_address,
            total_amount,
            status
        } = req.body;

        const [result] = await connection.query(
            `UPDATE orders 
             SET method_id = ?, session_id = ?, customer_name = ?, customer_email = ?, 
                 shipping_address = ?, billing_address = ?, total_amount = ?, status = ?
             WHERE id = ?`,
            [
                method_id || null,
                session_id || null,
                customer_name,
                customer_email,
                shipping_address,
                billing_address || null,
                total_amount,
                status,
                req.params.id
            ]
        );

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
        const [result] = await connection.query(
            'DELETE FROM orders WHERE id = ?',
            [req.params.id]
        );

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
module.exports = { index, show, store, update, destroy };