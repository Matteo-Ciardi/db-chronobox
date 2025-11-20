/************
     IMPORT
 ************/
const connection = require('../data/connection');


/*************************
    CONTROLLER FUNZIONI
**************************/

//--------------------------------------------------- INDEX ----------------------------------------------------
// Index - Mostra tutte le capsule
async function index(req, res) {

    // Definizione query
    const query_capsules = 
    ` SELECT *
      FROM capsule
    `;

    try {

        // Esecuzione query: recupero tutte le capsule dal database
        const [rows] = await connection.query(query_capsules);

        // Per ogni capsula aggiungo il percorso completo all’immagine
        const capsulesWithFullPathImgs = rows.map(capsule => {
            return {
                ...capsule,
                img: req.imagePath + capsule.img
            };
        });

        // Restituisco tutte le capsule in formato JSON
        res.json(capsulesWithFullPathImgs);
        
    } 
    
    // Gestione errore server
    catch (error) {
        // Restituisco errore server
        res.status(500).json({ error: error.message });
    }
}

//--------------------------------------------------- SHOW ----------------------------------------------------

// Show - Mostra una capsula specifica
async function show(req, res) {

    // Definizione query
    const query_capsule =
        ` SELECT * 
          FROM capsule 
          WHERE slug = ?
        `;

    try {

        // Esecuzione query
        const [rows] = await connection.query(query_capsule, [req.params.slug]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Capsule not found' });
        }

        // Aggiungo il percorso completo dell'immagine alla capsula selezionata
        const capsuleWithFullPathImg = {
            ...rows[0],
            img: req.imagePath + rows[0].img
        };

        // Restituisco la capsula in formato JSON
        res.json(capsuleWithFullPathImg);
    }

    // Gestione errore server
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}

//--------------------------------------------------- STORE ----------------------------------------------------

// Store - Crea una nuova capsula
async function store(req, res) {

    // Definizione query per creare una capsula
    const query_store_capsule =
        ` INSERT INTO capsule (name, img, description, price, discounted_price, dimension, material, weight, capacity, resistance, warrenty, color, theme)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

    try {

        // Recupero dati dal body della richiesta (tramite destructuring)
        const { name, img, description, price, discounted_price, dimension, material, weight, capacity, resistance, warrenty, color, theme} = req.body;

        // Validazione dei campi richiesti
        if (!name || !img || !description || !price || !discounted_price || !dimension || !material || !weight || !capacity || !resistance || !warrenty || !color || !theme) {
             return res.status(400).json({ error: 'Missing required fields' });
         }

        // Esecuzione query passando i valori recuperati dal body
        const [result] = await connection.query(
            query_store_capsule,
            [name, img, description, price, discounted_price, dimension, material, weight, capacity, resistance, warrenty, color, theme]
        );

        // Recupero id capsula creata
        const newId = result.insertId;

        // Definizione query per recuperare lo slug generato da MySQL
        const query_slug =
            ` SELECT slug 
              FROM capsule 
              WHERE id = ?
            `;

        // Esecuzione query: recupero slug
        const [slugResult] = await connection.query(query_slug, [newId]);

        // Estraggo lo slug dalla risposta
        const slug = slugResult[0]?.slug;

        // Risposta in caso di successo
        res.status(201).json(
            {
                id: result.insertId,
                slug: slug,
                message: 'Capsule created successfully'
            }
        );
    } 
    
    // Gestione errore
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}


// update - Aggiorna una capsula
async function update(req, res) {
    try {
        const { name, img, description, price, discounted_price, dimension, material, weight, capacity, resistance, warrenty, color, theme } = req.body;

        const [result] = await connection.query(
            `UPDATE capsule
            SET name = ?, img = ?, description = ?, price = ?, discounted_price = ?, dimension = ?, material = ?, weight = ?, capacity = ?, resistance = ?, warrenty = ?, color = ?, theme = ?
             WHERE id = ?`,
            [name, img, description, price, discounted_price, dimension, material, weight, capacity, resistance, warrenty, color, theme, req.params.id]
        );

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
        const [result] = await connection.query(
            'DELETE FROM capsule WHERE id = ?',
            [req.params.id]
        );

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
module.exports = {
    index,
    show,
    store,
    update,
    destroy
};