/* 
    Funzione principale di validazione capsule.
    Riceve in ingresso:
    - `data` -> oggetto contenente i valori ricevuti dal body della richiesta.
    - `isUpdate` -> false per STORE (campi obbligatori)
                    true  per UPDATE (campi facoltativi)
*/
    function validateCapsule(data, isUpdate) {

        const errors = [];

        // Funzione che controlla se un valore è vuoto
        const isEmpty = (value) =>
            value === undefined || value === null || value === "";


        /****************************************
            CAMPI OBBLIGATORI (solo per STORE)
        *****************************************/
        if (!isUpdate) {
            if (isEmpty(data.name)) errors.push("Il campo 'name' è obbligatorio");
            if (isEmpty(data.img)) errors.push("Il campo 'img' è obbligatorio");
            if (isEmpty(data.description)) errors.push("Il campo 'description' è obbligatorio");
            if (isEmpty(data.price)) errors.push("Il campo 'price' è obbligatorio");
            if (isEmpty(data.dimension)) errors.push("Il campo 'dimension' è obbligatorio");
            if (isEmpty(data.material)) errors.push("Il campo 'material' è obbligatorio");
            if (isEmpty(data.weight)) errors.push("Il campo 'weight' è obbligatorio");
            if (isEmpty(data.capacity)) errors.push("Il campo 'capacity' è obbligatorio");
            if (isEmpty(data.resistance)) errors.push("Il campo 'resistance' è obbligatorio");
            if (isEmpty(data.color)) errors.push("Il campo 'color' è obbligatorio");
            if (isEmpty(data.theme)) errors.push("Il campo 'theme' è obbligatorio");
            if (isEmpty(data.warrenty)) errors.push("Il campo 'warrenty' è obbligatorio");
        }

        /***************************
            VALIDAZIONE IMMAGINE 
        ****************************/
        const validImageExtensions = [".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg", ".avif"];

        if (!isEmpty(data.img)) {
            const imgLowercase = data.img.toLowerCase();                    // Converto il nome dell'immagine in minuscolo
            const hasValidExtension = validImageExtensions.some(ext =>      // Controllo se termina con una delle estensioni consentite
                imgLowercase.endsWith(ext)
            );

            // Se l'estensione NON è valida → errore
            if (!hasValidExtension) {
                errors.push("Il campo 'img' deve avere un'estensione valida (.png, .jpg, .jpeg, .webp, .gif, .svg, .avif)");
            }
        }

        /****************************
            VALIDAZIONE NUMERICA
        *****************************/

        // price
        if (!isEmpty(data.price) && isNaN(data.price)) {
            errors.push("Il campo 'price' deve essere un numero");
        }

        // discounted_price
        if (!isEmpty(data.discounted_price) && isNaN(data.discounted_price)) {
            errors.push("Il campo 'discounted_price' deve essere un numero");
        }

        // weight
        if (!isEmpty(data.weight) && isNaN(data.weight)) {
            errors.push("Il campo 'weight' deve essere un numero");
        }

        // capacity
        if (!isEmpty(data.capacity) && isNaN(data.capacity)) {
            errors.push("Il campo 'capacity' deve essere un numero");
        }

        // warrenty
        if (!isEmpty(data.warrenty) && isNaN(data.warrenty)) {
            errors.push("Il campo 'warrenty' deve essere un numero");
        }


        /***********************
            LIMITI NUMERICI
        ************************/

        // price > 0
        if (!isEmpty(data.price) && data.price <= 0) {
            errors.push("Il prezzo deve essere maggiore di zero");
        }

        // weight > 0
        if (!isEmpty(data.weight) && data.weight <= 0) {
            errors.push("Il peso deve essere maggiore di zero");
        }

        // capacity > 0
        if (!isEmpty(data.capacity) && data.capacity <= 0) {
            errors.push("La capacità deve essere maggiore di zero");
        }

        // discounted_price > 0 e < di price
        if (!isEmpty(data.discounted_price)) {
            if (data.discounted_price <= 0) {
                errors.push("Il prezzo scontato deve essere maggiore di zero");
            }

            if (!isEmpty(data.price) &&
                Number(data.discounted_price) >= Number(data.price)) {
                errors.push("Il prezzo scontato deve essere minore del prezzo originale");
            }
        }

        // warrenty (compresa tra 1 e 2 anni)
        if (!isEmpty(data.warrenty)) {
            const w = Number(data.warrenty);

            if (w < 1 || w > 2) {
                errors.push("La garanzia deve essere compresa tra 1 e 2 anni");
            }
        }


        /********************
            LIMITI FISICI
        *********************/
        if (!isEmpty(data.capacity) && data.capacity > 200) {
            errors.push("La capacità non può superare i 200 ml");
        }

        if (!isEmpty(data.weight) && data.weight > 300) {
            errors.push("Il peso non può superare i 300 g");
        }


        /****************
            STRINGHE
        *****************/
        // name — minimo 3 caratteri
        if (!isEmpty(data.name) && data.name.length < 3) {
            errors.push("Il nome deve avere almeno 3 caratteri");
        }

        // description — min 10, max 500 caratteri
        if (!isEmpty(data.description)) {
            if (data.description.length < 10) {
                errors.push("La descrizione deve avere almeno 10 caratteri");
            }
            if (data.description.length > 500) {
                errors.push("La descrizione è troppo lunga (max 500 caratteri)");
            }
        }

        // color — deve essere solo testo (niente numeri)
        if (!isEmpty(data.color) && /\d/.test(data.color)) {
            errors.push("Il colore non può contenere numeri");
        }

        // material — deve essere solo testo e con limite di lunghezza
        if (!isEmpty(data.material)) {
            if (/\d/.test(data.material)) {
                errors.push("Il materiale non può contenere numeri");
            }
            if (data.material.length > 100) {
                errors.push("Il materiale è troppo lungo (max 100 caratteri)");
            }
        }


        /****************************
            MATERIALE CONSENTITO
        *****************************/
        const validMaterials = ["plastica", "acciaio", "ferro", "bamboo", "legno", "alluminio"];

        if (!isEmpty(data.material) &&
            !validMaterials.includes(data.material.toLowerCase())) {
            errors.push("Il materiale inserito non è valido");
        }

        /**********************
            RISPOSTA FINALE
        ***********************/
        return errors.length > 0
            ? { valid: false, errors }
            : { valid: true };
    }

    // EXPORT
    module.exports = { validateCapsule };
