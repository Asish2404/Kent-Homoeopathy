export const calculateCartTotals = (cartItems) => {
    // cartItems is expected to be an array of cart documents with
    // populated product and quantity fields.
    // Totals are computed dynamically on every request.

    const totalItems = cartItems.reduce(
        (sum, item) => sum + (item.quantity || 0),
        0
    );

    const subtotal = cartItems.reduce((sum, item) => {
        // If the product was deleted, Mongoose population may leave it null.
        // Skip such items for safety.
        if (!item.product) return sum;

        const price = Number(item.product.price ?? item.product.discount_price ?? 0);
        const quantity = Number(item.quantity ?? 0);
        return sum + price * quantity;
    }, 0);

    return { totalItems, subtotal };
};

