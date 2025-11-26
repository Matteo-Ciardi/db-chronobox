/*
    Funzione principale di validazione ordini.
    Riceve in ingresso:
    - `data`     -> oggetto contenente i valori ricevuti dal body della richiesta.
    - `isUpdate` -> false per STORE (campi obbligatori)
                    true  per UPDATE (campi facoltativi)
*/

function validateOrder(data, isUpdate = false) {

    const errors = [];

    // Funzione che controlla se un valore è vuoto
    const isEmpty = (value) =>
        value === undefined || value === null || value === "";

    /*******************************************
        CAMPI OBBLIGATORI (solo per STORE)
    *******************************************/
    if (!isUpdate) {
        if (isEmpty(data.customer_name)) errors.push("Il campo 'customer_name' è obbligatorio");
        if (isEmpty(data.customer_email)) errors.push("Il campo 'customer_email' è obbligatorio");
        if (isEmpty(data.billing_address)) errors.push("Il campo 'billing_address' è obbligatorio");

        // Items deve essere array NON vuoto
        if (isEmpty(data.items) || !Array.isArray(data.items) || data.items.length === 0) {
            errors.push("L'ordine deve contenere almeno un item");
        }
    }

    /****************************
        VALIDAZIONE NUMERICA
    *****************************/

    if (!isEmpty(data.total_amount) && isNaN(data.total_amount)) {
        errors.push("Il campo 'total_amount' deve essere un numero");
    }


    /***********************
        LIMITI NUMERICI
    ***********************/

    if (!isEmpty(data.total_amount) && Number(data.total_amount) <= 0) {
        errors.push("Il totale deve essere maggiore di zero");
    }

    /****************
        STRINGHE
    ****************/

    if (!isEmpty(data.customer_name) && data.customer_name.trim().length < 3) {
        errors.push("Il campo 'customer_name' deve contenere almeno 3 caratteri");
    }

    if (!isEmpty(data.shipping_address) && data.shipping_address.trim().length < 5) {
        errors.push("Il campo 'shipping_address' deve contenere almeno 5 caratteri");
    }

    if (!isEmpty(data.billing_address) && data.billing_address.trim().length < 5) {
        errors.push("Il campo 'billing_address' deve contenere almeno 5 caratteri");
    }

    /**************************
        VALIDAZIONE EMAIL
    **************************/

    if (!isEmpty(data.customer_email)) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(data.customer_email)) {
            errors.push("Il formato dell'email non è valido");
        } else {
            const domain = data.customer_email.split("@")[1];
            if (!domain || !domain.includes(".")) {
                errors.push("Il dominio dell'email non è valido");
            }
        }
    }

    /************************
       VALIDAZIONE ITEMS
   **************************/
    if (Array.isArray(data.items)) {

        data.items.forEach((item, i) => {

            const prefix = `Item ${i + 1}: `;

            // quantity
            if (isEmpty(item.quantity) || isNaN(item.quantity)) {
                errors.push(prefix + "Il campo 'quantity' è obbligatorio e deve essere numerico");
            } else if (item.quantity <= 0) {
                errors.push(prefix + "La quantità deve essere maggiore di zero");
            }

            // unit_price
            if (item.unit_price == null || isNaN(item.unit_price)) {
                errors.push(prefix + "Il campo 'unit_price' è obbligatorio e deve essere numerico");
            } else if (Number(item.unit_price) < 0) {
                errors.push(prefix + "Il prezzo unitario non può essere negativo");
            }

            // shipping_period
            if (!isEmpty(item.shipping_period)) {
                const date = new Date(item.shipping_period);
                if (isNaN(date.getTime())) {
                    errors.push(prefix + "Il campo 'shipping_period' deve essere una data valida");
                }
            }
            // Letter
            if (!isEmpty(item.letter_content) && item.letter_content.length > 3000) {
                errors.push(prefix + "La lettera non può superare i 3000 caratteri");
            }

            // Sconto
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
    
    /**********************
        RISPOSTA FINALE
    ***********************/
    return errors.length > 0
        ? { valid: false, errors }
        : { valid: true };
}


// EXPORT
module.exports = { validateOrder };
