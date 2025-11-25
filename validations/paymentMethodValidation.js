/*  
    Funzione principale di validazione dei metodi di pagamento.
    Riceve in ingresso:
    - `data` → oggetto contenente i valori del body.
    - `isUpdate` → false per STORE (campi obbligatori)
                   true  per UPDATE (campi facoltativi)
*/

function validatePaymentMethod(data, isUpdate = false) {

    const errors = [];

    // Funzione che controlla se un valore è vuoto
    const isEmpty = (value) =>
        value === undefined || value === null || value === "";

    /****************************************
        CAMPI OBBLIGATORI (solo per STORE)
    *****************************************/
    if (!isUpdate) {
        if (isEmpty(data.name)) errors.push("Il campo 'name' è obbligatorio");
        if (isEmpty(data.provider)) errors.push("Il campo 'provider' è obbligatorio");
        if (isEmpty(data.type)) errors.push("Il campo 'type' è obbligatorio");
        if (isEmpty(data.logo_url)) errors.push("Il campo 'logo_url' è obbligatorio");
    }

    /****************
        STRINGHE
    *****************/
    // name
    if (!isEmpty(data.name) && data.name.length < 3) {
        errors.push("Il nome deve contenere almeno 3 caratteri");
    }

    // provider
    if (!isEmpty(data.provider) && data.provider.length < 2) {
        errors.push("Il provider deve contenere almeno 2 caratteri");
    }

    // description
    if (!isEmpty(data.description) && data.description.length > 500) {
        errors.push("La descrizione è troppo lunga (max 500 caratteri)");
    }

    /****************************
        VALIDAZIONE IMMAGINE
    *****************************/
    const validImageExtensions = [".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg", ".avif"];

    if (!isEmpty(data.logo_url)) {
        const urlLowercase = data.logo_url.toLowerCase();           // Converto il nome dell'immagine in minuscolo

        const hasValidExt = validImageExtensions.some(ext =>    // Controllo se termina con una delle estensioni consentite
            urlLowercase.endsWith(ext)
        );

        if (!hasValidExt) {
            errors.push("Il campo 'logo_url' deve contenere un’immagine valida (.png, .jpg, .jpeg, .webp, .gif, .svg, .avif)");
        }
    }

    /******************************************
        VALIDAZIONE VALORI AMMESSI PER TYPE
    *******************************************/
    const validTypes = ["card", "bank", "paypal", "crypto"];

    if (!isEmpty(data.type)) {
        const typeLower = data.type.toLowerCase();
        if (!validTypes.includes(typeLower)) {
            errors.push("Il campo 'type' non è valido");
        }
    }
    /****************************
        VALIDAZIONE NUMERICA
    *****************************/
    if (!isEmpty(data.active) && isNaN(data.active)) {
        errors.push("Il campo 'active' deve essere numerico (0 o 1)");
    }

    if (!isEmpty(data.active) && ![0, 1, "0", "1"].includes(data.active)) {
        errors.push("Il campo 'active' può essere solo 0 o 1");
    }

    /**********************
        RISPOSTA FINALE
    ***********************/
    return errors.length > 0
        ? { valid: false, errors }
        : { valid: true };
}

// EXPORT
module.exports = { validatePaymentMethod };
