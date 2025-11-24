/*
    Funzione che controlla che tutti i dati necessari
    per creare un ordine siano presenti e validi,
    prima che arrivino al database.
*/

function validateOrder(data) {

    const errors = [];

    /**************************
        CAMPI OBBLIGATORI
    ***************************/

    // Nome
    if (!data.customer_name || data.customer_name.trim().length < 3) {
        errors.push("Il campo 'customer_name' è obbligatorio e deve avere almeno 3 caratteri");
    }

    // Email
    if (!data.customer_email) {
        errors.push("Il campo 'customer_email' è obbligatorio");
    } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.customer_email)) {
            errors.push("Il formato dell'email non è valido");
        }
    }

    // Indirizzo di spedizione
    if (!data.shipping_address || data.shipping_address.trim().length < 5) {
        errors.push("Il campo 'shipping_address' è obbligatorio e deve contenere almeno 5 caratteri");
    }

    // Billing opzionale
    if (data.billing_address && data.billing_address.trim().length < 5) {
        errors.push("Il campo 'billing_address' è troppo corto");
    }


    /******************
        CAMPO STATUS
    ******************/

    if (data.status && typeof data.status !== "string") {
        errors.push("Il campo 'status' deve essere una stringa");
    }


    /******************
        TOTAL AMOUNT
    *******************/

    if (data.total_amount != null) {
        if (isNaN(data.total_amount)) {
            errors.push("Il campo 'total_amount' deve essere un numero");
        } else if (Number(data.total_amount) <= 0) {
            errors.push("Il totale deve essere maggiore di zero");
        }
    }


    /**************************
        METODO DI PAGAMENTO
    ***************************/

    if (data.method_id && isNaN(data.method_id)) {
        errors.push("Il campo 'method_id' deve essere numerico");
    }


    /**************************
        VALIDAZIONE ITEMS
    ***************************/

    if (!Array.isArray(data.items) || data.items.length === 0) {
        errors.push("L'ordine deve contenere almeno un item");
    } else {

        data.items.forEach((item, i) => {
            const prefix = `Item ${i + 1}: `;

            /*************
                ID CAPSULA
            *************/
            if (!item.capsule_id || isNaN(item.capsule_id)) {
                errors.push(prefix + "Il campo 'capsule_id' è obbligatorio e deve essere numerico");
            }

            /*************
                QUANTITÀ
            *************/
            if (!item.quantity || isNaN(item.quantity)) {
                errors.push(prefix + "Il campo 'quantity' è obbligatorio e deve essere numerico");
            } else if (item.quantity <= 0) {
                errors.push(prefix + "La quantità deve essere maggiore di zero");
            }

            /*************
                PREZZO UNITARIO
            *************/
            if (item.unit_price == null || isNaN(item.unit_price)) {
                errors.push(prefix + "Il campo 'unit_price' è obbligatorio e deve essere numerico");
            } else if (Number(item.unit_price) < 0) {
                errors.push(prefix + "Il prezzo unitario non può essere negativo");
            }

            /**********************
                DATA SPEDIZIONE
            **********************/
            if (item.shipping_period) {
                const date = new Date(item.shipping_period);
                if (isNaN(date.getTime())) {
                    errors.push(prefix + "Il campo 'shipping_period' deve essere una data valida");
                }
            }

            /**********************
                CONTENUTO LETTERA
            **********************/
            if (item.letter_content && item.letter_content.length > 500) {
                errors.push(prefix + "La lettera non può superare i 500 caratteri");
            }

            /**********************
                SCONTO %
            **********************/
            if (item.discount_percentage != null) {
                if (isNaN(item.discount_percentage)) {
                    errors.push(prefix + "Il campo 'discount_percentage' deve essere numerico");
                } else if (
                    item.discount_percentage < 0 ||
                    item.discount_percentage > 100
                ) {
                    errors.push(prefix + "Lo sconto deve essere compreso tra 0 e 100");
                }
            }
        });
    }


    /******************************
        RITORNO DELLA FUNZIONE
    *******************************/

    return errors.length > 0
        ? { valid: false, errors }
        : { valid: true };
}


/***************
    EXPORT
***************/
module.exports = { validateOrder };
