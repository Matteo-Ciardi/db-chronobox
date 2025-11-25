/************
     IMPORT
 ************/
const connection = require('../data/connection');
const { validateCapsule } = require("../validations/capsuleValidation");



/*************************
    CONTROLLER FUNZIONI
**************************/

//--------------------------------------------------- INDEX ----------------------------------------------------

// Index - Mostra tutte le capsule applicando filtri e ordinamenti dinamici
async function index(req, res) {

    // Estraggo i filtri dalla query string dell'URL
    const { search, theme, minPrice, maxPrice, order, onSale } = req.query;

    /******************************
        VALIDAZIONI QUERY STRING
    *******************************/

    // search deve essere stringa
    if (search && typeof search !== "string") {
        return res.status(400).json({ error: "Il parametro 'search' deve essere una stringa" });
    }

    // theme deve essere stringa
    if (theme && typeof theme !== "string") {
        return res.status(400).json({ error: "Il parametro 'theme' deve essere una stringa" });
    }

    // minPrice deve essere numero
    if (minPrice && isNaN(minPrice)) {
        return res.status(400).json({ error: "Il parametro 'minPrice' deve essere un numero" });
    }

    // maxPrice deve essere numero
    if (maxPrice && isNaN(maxPrice)) {
        return res.status(400).json({ error: "Il parametro 'maxPrice' deve essere un numero" });
    }

    // minPrice ≤ maxPrice
    if (minPrice && maxPrice && Number(minPrice) > Number(maxPrice)) {
        return res.status(400).json({ error: "minPrice non può essere maggiore di maxPrice" });
    }

    // onSale deve essere "true" o "false"
    if (onSale && onSale !== "true" && onSale !== "false") {
        return res.status(400).json({ error: "Il parametro 'onSale' deve essere 'true' o 'false'" });
    }

    // order deve essere uno tra quelli consentiti
    const validOrders = [
        "price_asc", "price_desc",
        "name_asc", "name_desc",
        "most_recent", "less_recent",
        "theme_asc", "theme_desc"
    ];

    if (order && !validOrders.includes(order)) {
        return res.status(400).json({ error: "Parametro 'order' non valido" });
    }

    // Definizione query di base: nessun filtro
    let query_capsules = ` 
        SELECT *
        FROM capsule
    `;

    let whereConditions = [];   // array contenente le condizioni da inserire nel WHERE "condizione = ?"
    let queryParams = [];       // array contenente i valori che sostituiranno i placeholder "?"

    /* -----------------------
          FILTRI DI RICERCA
    -------------------------- */

    // Ricerca per sconto
    if (onSale === "true") {
        whereConditions.push(`discounted_price IS NOT NULL AND discounted_price <> ''`);
    }

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
    if (whereConditions.length > 0) {
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

        case "most_recent":
            orderBy = " ORDER BY id DESC";
            break;

        case "less_recent":
            orderBy = " ORDER BY id ASC";
            break;

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
        ORDER BY capsule_most_popular.popularity_score DESC
        LIMIT 10;
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
            ON capsule.id = capsule_new_arrivals.capsule_id
        ORDER BY capsule_new_arrivals.arrival_order DESC
        LIMIT 10;
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

    // Definizione query per inserire una nuova capsula
    const query_store_capsule =
        ` INSERT INTO capsule (name, img, description, price, discounted_price, dimension, material, weight, capacity, resistance, warrenty, color, theme)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

    try {

        // Validazioni input utente
        const validation = validateCapsule(req.body, false); // false = modalità STORE (campi obbligatori)
        if (!validation.valid) {
            return res.status(400).json({ errors: validation.errors });
        }

        // Recupero dati dal body della richiesta (tramite destructuring)
        const { name, img, description, price, discounted_price, dimension, material, weight, capacity, resistance, warrenty, color, theme } = req.body;

        // Esecuzione query passando i valori recuperati dal body
        const [result] = await connection.query(
            query_store_capsule,
            [name, img, description, price, discounted_price, dimension, material, weight, capacity, resistance, warrenty, color, theme]
        );

        // Recupero id capsula creata
        const idCreatedCapsule = result.insertId;

        // Definizione query per recuperare lo slug generato da MySQL
        const query_slug =
            ` SELECT slug 
              FROM capsule 
              WHERE id = ?
            `;

        // Esecuzione query: recupero slug
        const [slugResult] = await connection.query(query_slug, [idCreatedCapsule]);

        // Recuper slug dalla risposta
        const slugCreatedCapsule = slugResult[0]?.slug;

        // Risposta in caso di successo
        res.status(201).json(
            {
                id: idCreatedCapsule,
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

// update - Aggiorna una capsula esistente
async function update(req, res) {

    // Recupero l'id dall'URL
    const id = parseInt(req.params.id);

    // Controllo se l'id è valido
    if (isNaN(id)) {
        return res.status(400).json({ error: "ID non valido" });
    }

    try {

        // Validazione input

        const validation = validateCapsule(req.body, true);     // true = modalità UPDATE (campi NON obbligatori)
        if (!validation.valid) {
            return res.status(400).json({ errors: validation.errors });
        }

        /****************************************
            COSTRUZIONE QUERY UPDATE DINAMICA
        ****************************************/

        // Array che conterrà le parti dinamiche della query
        // Esempio: ["color = ?", "price = ?", ...]
        const fields = [];

        // Valori corrispondenti ai campi da aggiornare
        const values = [];

        // Ciclo su OGNI proprietà del body
        for (const key in req.body) {

            // Valore del campo presente nel body
            const value = req.body[key];

            // Se il campo NON è undefined, null o stringa vuota → lo aggiorno
            if (value !== undefined && value !== null && value !== "") {
                fields.push(`${key} = ?`);
                values.push(value);
            }
        }

        // Se non è stato passato nessun campo da aggiornare → errore
        if (fields.length === 0) {
            return res.status(400).json({ error: "Nessun campo da aggiornare" });
        }

        // Aggiungo l'id come ultimo valore per il WHERE id = ?
        values.push(id);



        /****************************************
                ESECUZIONE QUERY UPDATE
        ****************************************/

        // Creo la query dinamica unendo i campi con la virgola
        const query = `
            UPDATE capsule
            SET ${fields.join(", ")}
            WHERE id = ?
        `;

        // Eseguo la query
        const [result] = await connection.query(query, values);

        // Se nessuna riga è stata modificata → id non trovato nel DB
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Capsula non trovata" });
        }

        // Recupero slug aggiornato
        const [slugResult] = await connection.query(
            "SELECT slug FROM capsule WHERE id = ?",
            [id]
        );

        // Estraggo lo slug aggiornato
        const updatedSlug = slugResult[0]?.slug;



        // Risposta in caso di successo

        res.json({
            id: id,
            slug: updatedSlug,
            message: "Capsula aggiornata con successo"
        });

    } 
    
    // Gestione errori
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