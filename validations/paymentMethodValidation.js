/* 
    Funzione che controlla che tutti i dati richiesti
    per creare o aggiornare un metodo di pagamento
    siano presenti e validi, prima di inserirli nel database.
*/

function validatePaymentMethod(data) {

    const errors = [];


    /**************************
        CAMPI OBBLIGATORI
    **************************/
    if (!data.name) {
        errors.push("Il campo 'name' è obbligatorio");
    }

    if (!data.provider) {
        errors.push("Il campo 'provider' è obbligatorio");
    }

    if (!data.type) {
        errors.push("Il campo 'type' è obbligatorio");
    }


    /**************************
            STRINGHE
    **************************/
    if (data.name && data.name.length < 3) {
        errors.push("Il campo 'name' deve avere almeno 3 caratteri");
    }

    if (data.provider && data.provider.length < 3) {
        errors.push("Il campo 'provider' deve avere almeno 3 caratteri");
    }


    /**************************
        TIPO CONSENTITO
    **************************/
    const allowedTypes = ["card", "paypal", "crypto", "bank_transfer"];

    if (data.type && !allowedTypes.includes(data.type)) {
        errors.push("Il campo 'type' contiene un valore non valido");
    }


    /**************************
        LOGO: estensione valida
    **************************/
    if (data.logo_url) {
        const validExtensions = [".png", ".jpg", ".jpeg", ".webp", ".svg"];
        const logo = data.logo_url.toLowerCase();

        const isValid = validExtensions.some(ext => logo.endsWith(ext));
        if (!isValid) {
            errors.push("Il campo 'logo_url' deve essere un'immagine valida (.png, .jpg, .jpeg, .webp, .svg)");
        }
    }


    /**************************
        ACTIVE: valore valido
    **************************/
    if (data.active !== undefined && ![0, 1, "0", "1", true, false].includes(data.active)) {
        errors.push("Il campo 'active' deve essere 0 o 1");
    }


    /**************************
        RITORNO DELLA FUNZIONE
    **************************/
    return errors.length > 0
        ? { valid: false, errors }
        : { valid: true };
}

module.exports = { validatePaymentMethod };
