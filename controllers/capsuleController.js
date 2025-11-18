/************
     IMPORT
 ************/
const connection = require('../data/connection');


/*************************
    CONTROLLER FUNZIONI
**************************/
//index - Mostra tutte le capsule - No imagePath
async function index(req, res) {
     try {
          const [rows] = await connection.query('SELECT * FROM capsule');
         res.json(rows);
    } catch (error) {
          res.status(500).json({ error: error.message });
     }
}

// index - Mostra Mostra tutte le capsule - Con imagePath per semplificare chiamata lato frontend
// async function index(req, res) {
//      try {
//          const [rows] = await connection.query('SELECT * FROM capsule');

//         // Aggiungo il percorso completo dell'immagine a ciascun tema
//         const capsulesWithFullPath = rows.map(capsule => {
//              return {
//                  ...capsule,
//                  img: req.imagePath + capsule.img
//             };
//         });

//          res.json(capsulesWithFullPath);

//      } catch (error) {
//         res.status(500).json({ error: error.message });
//      }
// }


// show - Mostra una capsula specifica - No imagePath
async function show(req, res) {
    try {
        const [rows] = await connection.query(
            'SELECT * FROM capsule WHERE id = ?',
            [req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Capsule not found' });
        }

        res.json(rows[0]);
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