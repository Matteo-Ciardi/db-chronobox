const express = require("express");
const gateway = require("../services/braintreeGateaway");

const router = express.Router();

// GET /api/braintree/token
router.get("/token", async (req, res) => {
    try {
        const response = await gateway.clientToken.generate({});
        res.json({ clientToken: response.clientToken });
    } catch (err) {
        console.error("Errore generazione client token Braintree:", err);
        res.status(500).json({ error: "Errore generazione client token" });
    }
});

module.exports = router;