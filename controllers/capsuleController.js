/************
     IMPORT
 ************/
const connection = require('../data/connection');


/*************************
    CONTROLLER FUNZIONI
**************************/

// Index - Mostra tutte le capsule
async function index(req, res) {

    // Definizione query
    const query_capsules = 
    `SELECT *
     FROM capsule`;

    try {

        // Esecuzione query
        const [rows] = await connection.query(query_capsules);

        // Aggiungo il percorso completo dell'immagine a ciascuna capsula
        const capsulesWithFullPathImgs = rows.map(capsule => {
            return {
                ...capsule,
                img: req.imagePath + capsule.img
            };
        });

        res.json(capsulesWithFullPathImgs);
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Show - Mostra una capsula specifica
async function show(req, res) {

    // Definizione query
    const query_capsule =
        `SELECT * FROM capsule WHERE id = ?`;

    try {

        // Esecuzione query
        const [rows] = await connection.query(query_capsule, [req.params.id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Capsule not found' });
        }

        // Aggiungo il percorso completo dell'immagine alla capsula selezionata
        const capsuleWithFullPathImg = {
            ...rows[0],
            img: req.imagePath + rows[0].img
        };

        res.json(capsuleWithFullPathImg);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// store - Crea una nuova capsula
async function store(req, res) {
    try {
        const { name, img, description, price, discounted_price, dimension, material, weight, capacity, resistance, worrenty, color, theme} = req.body;

        // Basic validation
        if (!name || !img || !description || !price || !discounted_price || !dimension || !material || !weight || !capacity || !resistance || !worrenty || !color || !theme) {
             return res.status(400).json({ error: 'Missing required fields' });
         }

        const [result] = await connection.query(
            `INSERT INTO capsule (name, img, description, price, discounted_price, dimension, material, weight, capacity, resistance, worrenty, color, theme)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, img, description, price, discounted_price, dimension, material, weight, capacity, resistance, worrenty, color, theme]
        );

        res.status(201).json({
            id: result.insertId,
            message: 'Capsule created successfully'
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}


// update - Aggiorna una capsula
async function update(req, res) {
    try {
        const { name, img, description, price, discounted_price, dimension, material, weight, capacity, resistance, worrenty, color, theme } = req.body;

        const [result] = await connection.query(
            `UPDATE capsule
            SET name = ?, img = ?, description = ?, price = ?, discounted_price = ?, dimension = ?, material = ?, weight = ?, capacity = ?, resistance = ?, worrenty = ?, color = ?, theme = ?
             WHERE id = ?`,
            [name, img, description, price, discounted_price, dimension, material, weight, capacity, resistance, worrenty, color, theme, req.params.id]
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