/****************
    MIDDLEWARE  
*****************/

// Funzione che gestisce dinamicamente il path base delle immagini
function setImagePath(req, res, next) {
    req.imagePath = `${req.protocol}://${req.get('host')}/imgs/capsules/`;
    next()
}


/************
    EXPORT
************/
module.exports = setImagePath;