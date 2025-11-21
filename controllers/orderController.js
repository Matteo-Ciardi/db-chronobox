/************
     IMPORT
 ************/
const connection = require('../data/connection');
const { sendOrderEmails } = require("../services/emailService");


/********************
    CONTROLLER FUNZIONI
*********************/

// --------------------------------------------------- INDEX ----------------------------------------------------

// index - Mostra tutti gli ordini
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

        // Esecuzione query: recupero tutti gli ordini dal database
        const [rows] = await connection.query(query_orders);

        //  Aggiungo il percorso completo alle immagini 
        const ordersWithFullImg = rows.map(order => {
            return {
                ...order,

                //  Immagini della capsula
                img: order.img ? req.imagePath + order.img : null,

                // Immagine inserita dall'utente per l'ordine
                file_path: order.file_path ? req.imagePath + order.file_path : null,

                // Logo del metodo di pagamento
                payment_method_logo: order.payment_method_logo ? req.imagePath + order.payment_method_logo : null
            };
        });

        // Restituisco tutti gli ordini in formato JSON
        res.json(ordersWithFullImg);
    } 
    
    // Gestione errore
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// --------------------------------------------------- SHOW ----------------------------------------------------

// show - Mostra un ordine specifico
async function show(req, res) {

    const id = parseInt(req.params.id); // Recupero id dall'URL

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
    WHERE orders.id = ?;`

    try {

        // Esecuzione query: recupero l'ordine dal database
        const [rows] = await connection.query(query_order, [id]);

        // Controllo se la SELECT non ha restituito risultati → l'ID non esiste
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Preparazione dei percorsi completi immagini capsula e immagini ordine
        const order = rows[0];

        //  Aggiungo il percorso completo alle immagini 
        const orderWithFullPath = {
            ...order,
            
            //  Immagini della capsula
            img: order.img ? req.imagePath + order.img : null,

            // Immagine inserita dall'utente per l'ordine
            file_path: order.file_path ? req.imagePath + order.file_path : null,

            // Logo del metodo di pagamento
            payment_method_logo: order.payment_method_logo ? req.imagePath + order.payment_method_logo : null
        };

        // Restituisco l'ordine in formato JSON
        res.json(orderWithFullPath);

    }

    // Gestione errore
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}


// --------------------------------------------------- STORE ----------------------------------------------------

// store - Crea un ordine
async function store(req, res) {
  try {
    const {
      method_id,
      customer_name,
      customer_email,
      shipping_address,
      billing_address,
      total_amount,
      status, 
      items 
    } = req.body;

    // Required fields validation
    if (!customer_name || !customer_email || !shipping_address || total_amount == null) {
      return res.status(400).json({
        error: 'Missing required fields (customer_name, customer_email, shipping_address, total_amount)'
      });
    }

    const [result] = await connection.query(
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

    const savedOrder = {
      id: result.insertId,
      customerName: customer_name,
      customerEmail: customer_email,
      shippingAddress: shipping_address,
      items: Array.isArray(items) ? items : []
    };

    // risposta  al FE
    res.status(201).json({
      id: savedOrder.id,
      message: 'Order created successfully'
    });
    
console.log(">>> provo a inviare email per ordine", savedOrder.id);

    // invia email  senza bloccare la risposta
    sendOrderEmails(savedOrder).catch((err) => {
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
        const {
            method_id,
            customer_name,
            customer_email,
            shipping_address,
            billing_address,
            total_amount,
            status
        } = req.body;

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

    const id = parseInt(req.params.id);   // Recupero ID dall'URL

    // Definizione query per eliminare una capsula
    const query_destroy_order =
        ` DELETE 
          FROM orders
          WHERE id = ?
        `;

    try {

        // Esecuzione query: elimina ordine dal database
        const [result] = await connection.query( query_destroy_order, [id]);

        // Controllo: se nessuna riga è stata eliminata → l'ID non esiste
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Risposta in caso di successo
        res.status(200).json({
            id: id,
            message: 'Order deleted successfully'
        });

    } 
    
    // Gestione errore
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}


/************
    EXPORT
************/
module.exports = { index, show, store, update, destroy };