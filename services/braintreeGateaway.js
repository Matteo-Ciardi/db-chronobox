const braintree = require("braintree");

const gateway = new braintree.BraintreeGateway({
    environment: braintree.Environment.Sandbox,
    merchantId: process.env.BRAIN_TREE_MERCHANT_ID,
    publicKey: process.env.BRAIN_TREE_PUBLIC_KEY,
    privateKey: process.env.BRAIN_TREE_PRIVATE_KEY,
});

module.exports = gateway;