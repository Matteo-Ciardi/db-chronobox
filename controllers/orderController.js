/************
     IMPORT
 ************/
const connection = require('../data/connection');
const { sendOrderEmails } = require("../services/emailService");
const gateway = require("../services/braintreeGateaway");
const { validateOrder } = require("../validations/orderValidation");


/************************
    CONTROLLER FUNZIONI
*************************/

// --------------------------------------------------- INDEX ----------------------------------------------------

// index - Mostra tutti gli ordini
async function index(req, res) {

    const query_orders =
        ` SELECT
        orders.id AS order_id,

        -- ORDINI
        orders.customer_name,
        orders.customer_email,
        orders.shipping_address,
        orders.billing_address,
        orders.total_amount,
        orders.status,
        orders.created_at,
        orders.updated_at,

        -- CAPSULA
        capsule.id AS capsule_id,
        capsule.name,
        capsule.slug,
        capsule.img,
        capsule.color,
        capsule.theme,

        -- CAPSULE ORDER
        capsule_order.quantity,
        capsule_order.unit_price,
        capsule_order.shipping_period,
        capsule_order.letter_content,
        capsule_order.discount_percentage,

        -- IMMAGINI INSERITE NELL'ORDINE
        capsule_order_images.file_path,
        capsule_order_images.original_filename,
        capsule_order_images.uploaded_at,

        -- METODO DI PAGAMENTO (solo informazioni utili)
        payment_method.name AS payment_method_name,
        payment_method.type AS payment_method_type,
        payment_method.logo_url AS payment_method_logo
                
        FROM orders
        INNER JOIN capsule_order
            ON orders.id = capsule_order.order_id
        INNER JOIN capsule 
            ON capsule_order.capsule_id = capsule.id
        LEFT JOIN capsule_order_images
            ON capsule_order_images.order_id = orders.id
        LEFT JOIN payment_method
            ON orders.method_id = payment_method.id
        ORDER BY orders.created_at DESC;
    `;

    try {
        const [rows] = await connection.query(query_orders);

        const ordersWithFullImg = rows.map(order => ({
            ...order,
            img: order.img ? req.imagePath + order.img : null,
            file_path: order.file_path ? req.imagePath + order.file_path : null,
            payment_method_logo: order.payment_method_logo ? req.imagePath + order.payment_method_logo : null
        }));

        res.json(ordersWithFullImg);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// --------------------------------------------------- SHOW ----------------------------------------------------

// show - Mostra un ordine specifico
async function show(req, res) {

    const id = parseInt(req.params.id);

    const query_order = `
    SELECT
        -- ORDINI
        orders.id AS order_id,
        orders.customer_name,
        orders.customer_email,
        orders.shipping_address,
        orders.billing_address,
        orders.total_amount,
        orders.status,
        orders.created_at,
        orders.updated_at,

        -- CAPSULA
        capsule.id AS capsule_id,
        capsule.name,
        capsule.slug,
        capsule.img,
        capsule.color,
        capsule.theme,

        -- CAPSULE ORDER
        capsule_order.quantity,
        capsule_order.unit_price,
        capsule_order.shipping_period,
        capsule_order.letter_content,
        capsule_order.discount_percentage,

        -- IMMAGINI INSERITE NELL'ORDINE
        capsule_order_images.file_path,
        capsule_order_images.original_filename,
        capsule_order_images.uploaded_at,

        -- METODO DI PAGAMENTO
        payment_method.name AS payment_method_name,
        payment_method.type AS payment_method_type,
        payment_method.logo_url AS payment_method_logo
                    
    FROM orders
    INNER JOIN capsule_order
        ON orders.id = capsule_order.order_id
    INNER JOIN capsule 
        ON capsule_order.capsule_id = capsule.id
    LEFT JOIN capsule_order_images
        ON capsule_order_images.order_id = orders.id
    LEFT JOIN payment_method
        ON orders.method_id = payment_method.id
    WHERE orders.id = ?;`;

    try {
        const [rows] = await connection.query(query_order, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const order = rows[0];

        const orderWithFullPath = {
            ...order,
            img: order.img ? req.imagePath + order.img : null,
            file_path: order.file_path ? req.imagePath + order.file_path : null,
            payment_method_logo: order.payment_method_logo ? req.imagePath + order.payment_method_logo : null
        };

        res.json(orderWithFullPath);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// --------------------------------------------------- STORE ----------------------------------------------------

// store - Crea un ordine
async function store(req, res) {

    try {

        // Recupero dati dal body della richiesta (tramite destructuring)
        const { method_id, customer_name, customer_email, shipping_address, billing_address, total_amount, status, items, paymentNonce } = req.body;

        // Validazione dei campi
        const validation = validateOrder(req.body);
        if (!validation.valid) {
            return res.status(400).json({ errors: validation.errors });
        }

        const amount = Number(total_amount).toFixed(2);

        let btResult;
        try {

            // 1) creazione transazione Braintree
            btResult = await gateway.transaction.sale({
                amount: amount.toString(),
                paymentMethodNonce: paymentNonce,
                options: {
                    submitForSettlement: true,
                },
            });

        } catch (error) {
            console.error("Errore nel checkout Braintree:", error);
            return res.status(500).json({
                error: "Errore nel checkout"
            });
        }

        if (!btResult.success) {
            console.error("Pagamento Braintree fallito:", btResult);
            return res.status(402).json({
                success: false,
                message: "Pagamento rifiutato",
                errors: btResult.errors,
            });
        }

        const transactionId = btResult.transaction.id;
        console.log("Pagamento Braintree OK, transactionId:", transactionId);

        // Inserisco ordine
        const [dbResult] = await connection.query(
            `INSERT INTO orders 
                (method_id, customer_name, customer_email, shipping_address, billing_address, total_amount, status)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                method_id || null,
                customer_name,
                customer_email,
                shipping_address,
                billing_address || null,
                total_amount,
                status || 'pending'
            ]
        );

        // ==========================================================
        // ✅ NORMALIZZO ITEMS PER EMAIL (snake_case -> camelCase)
        // così emailService legge lettera e data da ogni item
        // ==========================================================
        const normalizedItems = Array.isArray(items)
            ? items.map(i => ({
                name: i.name,
                quantity: i.quantity ?? 1,
                price: i.price ?? i.unit_price ?? 0,
                img: i.img,

                // questi due campi servono per stampare UNA lettera per capsula
                letterContent: i.letterContent ?? i.letter_content ?? null,
                shippingDate: i.shippingDate ?? i.shipping_period ?? null,
            }))
            : [];

        const savedOrder = {
            id: dbResult.insertId,
            customerName: customer_name,
            customerEmail: customer_email,
            shippingAddress: shipping_address,
            billingAddress: billing_address || null,

            // fallback dal primo item (non è più la fonte principale)
            shippingDate: normalizedItems?.[0]?.shippingDate || null,
            letterContent: normalizedItems?.[0]?.letterContent || null,

            // ✅ items puliti che userà la mail
            items: normalizedItems
        };

        // Risposta al FE
        res.status(201).json({
            id: savedOrder.id,
            message: 'Order created successfully'
        });

        console.log(">>> provo a inviare email per ordine", savedOrder.id);

        // Invio email (non blocca la risposta)
        sendOrderEmails(savedOrder)
            .then(() => {
                console.log(">>> email FINITE per ordine", savedOrder.id);
            })
            .catch((err) => {
                console.error("Email send failed:", err);
            });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// --------------------------------------------------- UPDATE ----------------------------------------------------

// update - Aggiorna un ordine
async function update(req, res) {

   
    try {

        // Recupero dati dal body della richiesta (tramite destructuring)
        const { method_id, customer_name, customer_email, shipping_address, billing_address, total_amount, status } = req.body;

        // Validazione dei campi
        const validation = validateOrder(req.body);
        if (!validation.valid) {
            return res.status(400).json({ errors: validation.errors });
        }

        const [result] = await connection.query(
            `UPDATE orders 
             SET method_id = ?, customer_name = ?, customer_email = ?, 
                 shipping_address = ?, billing_address = ?, total_amount = ?, status = ?
             WHERE id = ?`,
            [
                method_id || null,
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
            return res.status(404).json({ error: "Order not found" });
        }

        res.json({ message: "Order updated successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// --------------------------------------------------- DESTROY ----------------------------------------------------

// destroy - Elimina un ordine
async function destroy(req, res) {
    const id = parseInt(req.params.id);

    const query_destroy_order =
        ` DELETE 
          FROM orders
          WHERE id = ?
        `;

    try {
        const [result] = await connection.query(query_destroy_order, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.status(200).json({
            id: id,
            message: 'Order deleted successfully'
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}


/************
    EXPORT
************/
module.exports = { index, show, store, update, destroy };
