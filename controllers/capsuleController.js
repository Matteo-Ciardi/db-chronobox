/************
     IMPORT
 ************/
const connection = require('../data/connection');


/*************************
    CONTROLLER FUNZIONI
**************************/

//--------------------------------------------------- RELATED ----------------------------------------------------
// Related - Mostra capsule con lo stesso theme della capsula corrente
async function related(req, res) {
    const slug = req.params.slug;

    try {
        // 1. Trova la capsula corrente per scoprire il theme
        const query_get_capsule =
        ` SELECT theme 
          FROM capsule 
          WHERE slug = ?
        `;

        const [capsuleResult] = await connection.query(query_get_capsule, [slug]);

        if (capsuleResult.length === 0) {
            return res.status(404).json({ error: "Capsule not found" });
        }

        const theme = capsuleResult[0].theme;

        // 2. Trova tutte le capsule con lo stesso theme
        const query_related =
        ` SELECT *
          FROM capsule
          WHERE theme = ?
          AND slug <> ?      -- per NON mostrare la capsula aperta
        `;

        const [relatedRows] = await connection.query(query_related, [theme, slug]);

        // Aggiungo il percorso completo all'immagine
        const relatedWithPath = relatedRows.map(capsule => ({
            ...capsule,
            img: req.imagePath + capsule.img
        }));

        res.json(relatedWithPath);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}



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
    
    // Gestione errore
    catch (error) {
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
        // Recupero slug dall'URL
        const slug = req.params.slug;

        // Esecuzione query
        const [rows] = await connection.query(query_capsule, [slug]);

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
        const idCeatedCapsule = result.insertId;

        // Definizione query per recuperare lo slug generato da MySQL
        const query_slug =
            ` SELECT slug 
              FROM capsule 
              WHERE id = ?
            `;

        // Esecuzione query: recupero slug
        const [slugResult] = await connection.query(query_slug, [idCeatedCapsule]);

        // Recuper slug dalla risposta
        const slugCreatedCapsule = slugResult[0]?.slug;

        // Risposta in caso di successo
        res.status(201).json(
            {
                id: idCeatedCapsule,
                slug: slugCreatedCapsule,
                message: 'Capsule created successfully'
            }
        );
    } 
    
    // Gestione errore
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}

//--------------------------------------------------- UPDATE ----------------------------------------------------

// update - Aggiorna una capsula
async function update(req, res) {

    const id = parseInt(req.params.id); // Recupero id dall'URL
    const { name, img, description, price, discounted_price, dimension, material, weight, capacity, resistance, warrenty, color, theme } = req.body;  // Recupero dati dal body della richiesta (tramite destructuring)

    // Definizione query per aggiornate una capsula
    const query_update_capsule =
        ` UPDATE capsule
          SET name = ?, img = ?, description = ?, price = ?, discounted_price = ?, dimension = ?, material = ?, weight = ?, capacity = ?, resistance = ?, warrenty = ?, color = ?, theme = ?
          WHERE id = ?
        `;

    try {
        // Esecuzione query: aggiorna capsula
        const [result] = await connection.query(
            query_update_capsule,
            [name, img, description, price, discounted_price, dimension, material, weight, capacity, resistance, warrenty, color, theme, id]
        );

        // Controllo se nessuna riga è stata modificata -> l'ID non esiste
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Capsule not found' });
        }
        
        // Definizione query per recuperare lo slug aggiornato da MySQL
        const query_slug =
            ` SELECT slug 
              FROM capsule 
              WHERE id = ?
            `;

        // Esecuzione query: recupero slug
        const [slugResult] = await connection.query(query_slug, [id]);

        // Recuper slug dalla risposta
        const slugUpdatedCapsule = slugResult[0]?.slug;

        // Risposta in caso di successo
        res.status(200).json(
            {
                id: id,
                slug: slugUpdatedCapsule,
                message: 'Capsule updated successfully'
            }
        );
    }

    // Gestione errore
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}

//--------------------------------------------------- Destroy ----------------------------------------------------

// Delete - Elimina una capsula
async function destroy(req, res) {

    const id = parseInt(req.params.id);  // Recupero id dall'URL

    // Definizione query per recuperare lo slug (prima di eliminare la capsula)
    const query_get_slug = 
    `
        SELECT slug 
        FROM capsule 
        WHERE id = ?
    `;

    // Definizione query per eliminare una capsula
    const query_delete_capsule =
        ` DELETE 
          FROM capsule 
          WHERE id = ?
        `;

    try {

        // Esecuzione query: recupero slug
        const [rows] = await connection.query(query_get_slug, [id]);

        // Se la capsula non esiste → 404
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Capsule not found' });
        }

        const slugDeletedCapsule = rows[0].slug; // salvo lo slug

        // Commento
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Capsule not found' });
        }

        // Esecuzione query: elimina capsula
        const [result] = await connection.query(query_delete_capsule, [id]);

        // Risposta in caso di successo
        res.status(200).json(
            {
                id: id,
                slug: slugDeletedCapsule,
                message: 'Capsule deleted successfully'
            }
        );
    } 
    
    // Gestione errore
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}


/************
    EXPORT
************/
module.exports = { index, show, store, update, destroy, related };