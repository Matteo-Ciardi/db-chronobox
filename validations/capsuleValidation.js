/* 
    Funzione che controlla che tutti i dati necessari
    per creare o aggiornare una capsula siano presenti
    e validi, prima che arrivino al database.
*/

function validateCapsule(data) {

    const errors = [];

    /**************************
        CAMPI OBBLIGATORI
    ****************************/
    if (!data.name) errors.push("Il campo 'name' è obbligatorio");
    if (!data.img) errors.push("Il campo 'img' è obbligatorio");
    if (!data.description) errors.push("Il campo 'description' è obbligatorio");
    if (!data.price) errors.push("Il campo 'price' è obbligatorio");
    if (!data.dimension) errors.push("Il campo 'dimension' è obbligatorio");
    if (!data.material) errors.push("Il campo 'material' è obbligatorio");
    if (!data.weight) errors.push("Il campo 'weight' è obbligatorio");
    if (!data.capacity) errors.push("Il campo 'capacity' è obbligatorio");
    if (!data.resistance) errors.push("Il campo 'resistance' è obbligatorio");
    if (!data.color) errors.push("Il campo 'color' è obbligatorio");
    if (!data.theme) errors.push("Il campo 'theme' è obbligatorio");
    if (!data.warrenty) errors.push("Il campo 'warrenty' è obbligatorio");

    /*********************************
        IMMAGINE: estensione valida
     *********************************/
    const validImageExtensions = [".png", ".jpg", ".jpeg", ".webp", ".gif"];

    if (data.img) {
        const imgLower = data.img.toLowerCase();                         // Converto nome immagine in minuscolo
        const hasValidExtension = validImageExtensions.some(ext =>       // Controllo se l'immagine termina con una delle estensioni valide
            imgLower.endsWith(ext)
        );

        // Se non termina con estensione valida → errore
        if (!hasValidExtension) {
            errors.push("Il campo 'img' deve essere un file immagine valido (.png, .jpg, .jpeg, .webp, .gif)");
        }
    }


    /**********************
        CAMPI NUMERICI
    ***********************/
    if (data.price && isNaN(data.price)) {
        errors.push("Il campo 'price' deve essere un numero");
    }

    if (data.discounted_price && isNaN(data.discounted_price)) {
        errors.push("Il campo 'discounted_price' deve essere un numero");
    }

    if (data.weight && isNaN(data.weight)) {
        errors.push("Il campo 'weight' deve essere un numero");
    }

    if (data.capacity && isNaN(data.capacity)) {
        errors.push("Il campo 'capacity' deve essere un numero");
    }


    /***********************
        LIMITI NUMERICI
    ************************/

    // Numeri non possono essere 0 o negativi
    if (data.price <= 0) errors.push("Il prezzo deve essere maggiore di zero");
    if (data.weight <= 0) errors.push("Il peso deve essere maggiore di zero");
    if (data.capacity <= 0) errors.push("La capacità deve essere maggiore di zero");

    // discounted_price: se presente, deve essere > 0 e < price
    if (data.discounted_price !== undefined && data.discounted_price !== "") {

        if (data.discounted_price <= 0) {
            errors.push("Il prezzo scontato deve essere maggiore di zero");
        }

        if (!isNaN(data.price) &&
            !isNaN(data.discounted_price) &&
            data.discounted_price >= data.price) {

            errors.push("Il prezzo scontato deve essere minore del prezzo originale");
        }
    }

    // Limiti fisici realistici
    if (data.capacity > 2000) errors.push("La capacità non può superare i 2000 ml");
    if (data.weight > 3000) errors.push("Il peso non può superare i 3000 g");


    /****************
        STRINGHE
    *****************/
    if (data.name && data.name.length < 3) {
        errors.push("Il nome deve avere almeno 3 caratteri");
    }

    if (data.description && data.description.length < 10) {
        errors.push("La descrizione deve avere almeno 10 caratteri");
    }

    if (data.description && data.description.length > 500) {
        errors.push("La descrizione è troppo lunga (max 500 caratteri)");
    }

    // Limiti per coerenza
    if (data.color && /\d/.test(data.color)) {
        errors.push("Il colore non può contenere numeri");
    }

    if (data.material && data.material.length > 100) {
        errors.push("Il materiale è troppo lungo (max 100 caratteri)");
    }


    /*****************************
        MATERIALE CONSENTITO
    ******************************/
    const validMaterials = ["alluminio", "acciaio", "plastica dura", "biopolimero"];

    if (data.material && !validMaterials.includes(data.material.toLowerCase())) {
        errors.push("Il materiale inserito non è valido");
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
module.exports = { validateCapsule };
