/************
     IMPORT
 ************/
const connection = require('../data/connection');


/*************************
    CONTROLLER FUNZIONI
**************************/



//--------------------------------------------------- INDEX ----------------------------------------------------

// Index - Mostra tutte le capsule applicando filtri e ordinamenti dinamici
async function index(req, res) {

    // Estraggo i filtri dalla query string dell'URL
    const { search, theme, minPrice, maxPrice, order } = req.query;

    // Definizione query di base: nessun filtro
    let query_capsules =  ` 
        SELECT *
        FROM capsule
    `;

    let whereConditions = [];   // array contenente le condizioni da inserire nel WHERE "condizione = ?"
    let queryParams = [];       // array contenente i valori che sostituiranno i placeholder "?"

    /* -----------------------
          FILTRI DI RICERCA
    -------------------------- */

    // Ricerca (parziale) per nome della capsula
    if (search && search.trim() !== "") {
        whereConditions.push(`name LIKE ?`);
        queryParams.push(`%${search}%`);       
    }

    // Ricerca (parziale) per tema
    if (theme && theme.trim() !== "") {
        whereConditions.push(`theme LIKE ?`);
        queryParams.push(`%${theme}%`);
    }

    // Ricerca per prezzo minimo
    if (minPrice) {
        whereConditions.push(`price >= ?`);
        queryParams.push(minPrice);
    }

    // Ricerca per prezzo massimo
    if (maxPrice) {
        whereConditions.push(`price <= ?`);
        queryParams.push(maxPrice);
    }

    // Se ci sono condizioni, aggiungo il WHERE alla query
    if(whereConditions.length > 0 ) {
        query_capsules += " WHERE " + whereConditions.join(" AND ");
    }

    /* -------------------
           ORDINAMENTI
    ---------------------- */
    let orderBy = "";

    switch (order) {

        case "price_asc":
            orderBy = " ORDER BY price ASC";
            break;

        case "price_desc":
            orderBy = " ORDER BY price DESC";
            break;

        case "name_asc":
            orderBy = " ORDER BY name ASC";
            break;

        case "name_desc":
            orderBy = " ORDER BY name DESC";
            break;

        // case "recent":
        //     orderBy = " ORDER BY created_at DESC";
        //     break;

        // case "old":
        //     orderBy = " ORDER BY created_at ASC";
        //     break;

        case "theme_asc":
            orderBy = " ORDER BY theme ASC";
            break;

        case "theme_desc":
            orderBy = " ORDER BY theme DESC";
            break;

        default:
            orderBy = "";
    }

    // Query finale
    const finalQuery = query_capsules + orderBy;

    try {

        // Esecuzione query con i valori effettivi del placeholder letti dall'URL
        const [rows] = await connection.query(finalQuery, queryParams);

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

//--------------------------------------------------- MOST POPULAR ----------------------------------------------------

// mostPopular - Mostra le capsule più popolari
async function mostPopulars(req, res) {

    // Definizione query
    const query_mostPopulars = `
        SELECT 
            capsule.*, 
            capsule_most_popular.popularity_score
        FROM capsule
        INNER JOIN capsule_most_popular
            on capsule.id = capsule_most_popular.capsule_id
        ORDER BY capsule_most_popular.popularity_score DESC;
    `;

    try {

        // Esecuzione query: recupero le capsule più popolari dal database
        const [rows] = await connection.query(query_mostPopulars);

        // Per ogni capsula più popolare aggiungo il percorso completo all’immagine
        const popularsWithFullPathImgs = rows.map(capsule => {
            return {
                ...capsule,
                img: req.imagePath + capsule.img
            };
        });

        // Restituisco tutte le capsule più popolari in formato JSON
        res.json(popularsWithFullPathImgs);
    }

    // Gestione errore
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}

//--------------------------------------------------- NEW ARRIVALS ----------------------------------------------------
// newArrivals - Mostra le nuove capsule
async function newArrivals(req, res) {

    // Definizione query
    const query_newArrivals = `
        SELECT 
            capsule.*, 
            capsule_new_arrivals.arrival_order
        FROM capsule
        INNER JOIN capsule_new_arrivals
            on capsule.id = capsule_new_arrivals.capsule_id
        ORDER BY capsule_new_arrivals.arrival_order ASC;
    `;

    try {

        // Esecuzione query: recupero le nuove capsule dal database
        const [rows] = await connection.query(query_newArrivals);

        // Per ogni capsula nuova aggiungo il percorso completo all’immagine
        const newArrivalsWithFullPathImgs = rows.map(capsule => {
            return {
                ...capsule,
                img: req.imagePath + capsule.img
            };
        });

        // Restituisco tutte le capsule più popolari in formato JSON
        res.json(newArrivalsWithFullPathImgs);
    }

    // Gestione errore
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}

//--------------------------------------------------- RELATED ----------------------------------------------------
// Related - Mostra capsule appartenenti allo stesso tema

async function related(req, res) {

    // Recupero slug dall'URL
    const slug = req.params.slug;

    try {

        // Definizione query: recupero il tema dalla capsula corrente
        const query_get_capsule = ` 
            SELECT theme 
            FROM capsule 
            WHERE slug = ?
        `;

        // Esecuzione query
        const [capsuleResult] = await connection.query(query_get_capsule, [slug]);

        // Controllo se la SELECT non ha restituito risultati → l'ID non esiste
        if (capsuleResult.length === 0) {
            return res.status(404).json({ error: "Capsule not found" });
        }

        // Estraggo il valore del tema dalla capsula trovata
        const theme = capsuleResult[0].theme;

        // Definizione query: trova tutte le capsule con lo stesso tema
        const query_related = ` 
            SELECT *
             FROM capsule
            WHERE theme = ?
            AND slug <> ?      -- per NON mostrare la capsula aperta
        `;

        // Esecuzione query
        const [relatedRows] = await connection.query(query_related, [theme, slug]);

        // Per ogni capsula correlata aggiungo il percorso completo all’immagine
        const relatedWithPath = relatedRows.map(capsule => ({
            ...capsule,
            img: req.imagePath + capsule.img
        }));

        // Restituisco le capsule correlate in formato JSON
        res.json(relatedWithPath);
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

        // Controllo se la SELECT non ha restituito risultati → l'ID non esiste
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

        // Controllo: se nessuna riga è stata modificata -> l'ID non esiste
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
    const query_destroy_capsule =
        ` DELETE 
          FROM capsule 
          WHERE id = ?
        `;

    try {

        // Esecuzione query: recupero slug
        const [rows] = await connection.query(query_get_slug, [id]);

        // Controllo se la SELECT non ha restituito risultati → l'ID non esiste
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Capsule not found' });
        }

        const slugDeletedCapsule = rows[0].slug; // salvo lo slug

        // Esecuzione query: elimina capsula
        const [result] = await connection.query(query_destroy_capsule, [id]);

        // Controllo: se nessuna riga è stata modificata -> l'ID non esiste
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Capsule not found" });
        }

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
module.exports = { index, mostPopulars, newArrivals, related, show, store, update, destroy };