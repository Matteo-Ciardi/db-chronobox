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

// index - Mostra tutti gli ordini con relative capsule, immagini e metodo di pagamento
async function index(req, res) {

    // Definizione query
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

        // Esecuzione query: recupero tutti gli ordini dal db
        const [rows] = await connection.query(query_orders);

        // Aggiungo percorso completo a img, file_path e payment_method_logo
        const ordersWithFullImg = rows.map(order => ({
            ...order,
            img: order.img ? req.imagePath + order.img : null,
            file_path: order.file_path ? req.imagePath + order.file_path : null,
            payment_method_logo: order.payment_method_logo ? req.imagePath + order.payment_method_logo : null
        }));

        // Restituisco tutti gli ordini in formato JSON
        res.json(ordersWithFullImg);

    } 
    
    // Gestione errori
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// --------------------------------------------------- SHOW ----------------------------------------------------

// show - Mostra un ordine specifico
async function show(req, res) {

    // Recupero id dall'URL
    const id = parseInt(req.params.id);

    // Definizione query
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

        // Esecuzione query: recupero ordine dal db
        const [rows] = await connection.query(query_order, [id]);

        // Nessun ordine trovato
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Recupero ordine
        const order = rows[0];

        // Aggiungo path completo a img, file_path e payment_method_logo
        const orderWithFullPath = {
            ...order,
            img: order.img ? req.imagePath + order.img : null,
            file_path: order.file_path ? req.imagePath + order.file_path : null,
            payment_method_logo: order.payment_method_logo ? req.imagePath + order.payment_method_logo : null
        };

        // Restituisco l'ordine in formato JSON
        res.json(orderWithFullPath);

    } 
    
    // Gestione errori
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// --------------------------------------------------- STORE ----------------------------------------------------

// store - Crea un ordine
async function store(req, res) {

    try {

        // Validazione input utente
        const validation = validateOrder(req.body, false);   // false = STORE → campi obbligatori
        if (!validation.valid) {
            return res.status(400).json({ errors: validation.errors });
        }


        // Recupero dati dal body della richiesta (tramite destructuring)
        const { method_id, customer_name, customer_email, shipping_address, billing_address, total_amount, status, items, paymentNonce } = req.body;


        /***************************
            CHECKOUT BRAINTREE
        ****************************/
        const amount = Number(total_amount).toFixed(2);         // Formatto l'importo a due cifre decimali
        let btResult;

        try {

            // Creazione transazione Braintree
            btResult = await gateway.transaction.sale({
                amount: amount.toString(),
                paymentMethodNonce: paymentNonce,
                options: { submitForSettlement: true, },
            });

        } 
        
        // Gestione errori
        catch (error) {
            console.error("Errore nel checkout Braintree:", error);
            return res.status(500).json({
                error: "Errore nel checkout"
            });
        }

        // Pagamento rifiutato
        if (!btResult.success) {
            console.error("Pagamento Braintree fallito:", btResult);
            return res.status(402).json({
                success: false,
                message: "Pagamento rifiutato",
                errors: btResult.errors,
            });
        }

        // Pagamento accettato
        const transactionId = btResult.transaction.id;
        console.log("Pagamento Braintree OK, transactionId:", transactionId);

        // Definizione query
        const query_store_order = `
            INSERT INTO orders 
                (method_id, customer_name, customer_email, shipping_address, billing_address, total_amount, status)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        // Esecuzione query: inserimento ordine
        const [dbResult] = await connection.query(
            query_store_order,
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
  ? items.map((i) => {
      
      const letter =
        i.letter ??
        i.letterContent ??
        i.letter_content ??
        null;

      
      const shippingDate =
        i.shippingDate ??
        i.shipping_period ??
        null;

      return {
        name: i.name,
        quantity: i.quantity ?? 1,
        price: i.price ?? i.unit_price ?? 0,
        img: i.img,

        
        letter,
        letterContent: letter,
        shippingDate,
      };
    })
  : [];

        
        const savedOrder = {
            id: dbResult.insertId,
            customerName: customer_name,
            customerEmail: customer_email,
            shippingAddress: shipping_address,
            billingAddress: billing_address,
          
            // fallback dal primo item 
            shippingDate: normalizedItems?.[0]?.shippingDate || null,
            letterContent: normalizedItems?.[0]?.letterContent || null,


            // items che userà la mail
            items: normalizedItems

        };

        // Risposta in caso di successo
        res.status(201).json({
            id: savedOrder.id,
            message: 'Order created successfully'
        });

      
        /*******************
            INVIO EMAIL
        ********************/

        console.log(">>> provo a inviare email per ordine", savedOrder.id);

        sendOrderEmails(savedOrder)
            .then(() => {
                console.log(">>> email FINITE per ordine", savedOrder.id);
            })
            .catch((err) => {
                console.error("Email send failed:", err);
            });

    } 
    
    // Gestione errori
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// --------------------------------------------------- UPDATE ----------------------------------------------------

// update - Aggiorna un ordine
async function update(req, res) {

   
    try {

        // Validazione input utente
        const validation = validateOrder(req.body, true);  // true = UPDATE → campi NON obbligatori
        if (!validation.valid) {
            return res.status(400).json({ errors: validation.errors });
        }

        // Recupero dati dal body della richiesta (tramite destructuring)
        const { method_id, customer_name, customer_email, shipping_address, billing_address, total_amount, status } = req.body;

        // Definizione query
        const query_update_order = `
            UPDATE orders
            SET method_id = ?, 
                customer_name = ?, 
                customer_email = ?, 
                shipping_address = ?, 
                billing_address = ?, 
                total_amount = ?, 
                status = ?
            WHERE id = ?
        `;

        // Esecuzione query: aggiorna ordine
        const [result] = await connection.query(
            query_update_order,
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

        // Nessuna modifica → ID inesistente
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Order not found" });
        }

        // Risposta in caso di successo
        res.json({ message: "Order updated successfully" });
    } 
    
    // Gestione errori
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// --------------------------------------------------- DESTROY ----------------------------------------------------

// destroy - Elimina un ordine
async function destroy(req, res) {

    // Recupero id dall'URL
    const id = parseInt(req.params.id);

    // Definizione query 
    const query_destroy_order =
        ` DELETE 
          FROM orders
          WHERE id = ?
        `;

    try {

        // Esecuzione query: elimino ordine dal database
        const [result] = await connection.query(query_destroy_order, [id]);

        // Controllo: nessuna riga eliminata → ordine inesistente
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Risposta in caso di successo
        res.status(200).json({
            id: id,
            message: 'Order deleted successfully'
        });

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
