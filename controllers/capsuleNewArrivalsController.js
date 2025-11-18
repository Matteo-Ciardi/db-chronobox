/************
     IMPORT
 ************/
const connection = require('../data/connection');


/*************************
    CONTROLLER FUNZIONI
**************************/
//index - Mostra tutte le capsule più popolari - No imagePath
async function index(req, res) {
    try {
        const [rows] = await connection.query('SELECT * FROM capsule_new_arrivals');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// show - Mostra una capsula più popolare specifica - No imagePath
async function show(req, res) {
    try {
        const [rows] = await connection.query(
            'SELECT * FROM capsule_new_arrivals WHERE id = ?',
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


/************
    EXPORT
************/
module.exports = {
    index,
    show,
};