const mysql = require('mysql2/promise');    // Importa mysql2 in modalità Promise per usare async/await

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,               // Se tutte le connessioni sono occupate: metti in attesa invece di dare errore
    connectionLimit: 10,                    // Numero massimo di connessioni simultanee nel pool
    queueLimit: 0,                          // 0 = nessun limite di richieste in coda quando il pool è pieno
    decimalNumbers: true                    // Impedisce che MySQL2 converta DECIMAL in stringhe.
});

module.exports = pool;                      // Esporta il pool da usare nei controller