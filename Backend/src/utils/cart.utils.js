export const calculateSubtotal = (items) => {
    if (!Array.isArray(items)) return 0;

    // Items are expected to include:
    // - quantity
    // - product.price
    return items.reduce((sum, item) => {
        const quantity = Number(item.quantity) || 0;
        const price = Number(item.product?.price) || 0;
        return sum + quantity * price;
    }, 0);
};

export const calculateDiscount = () => {
    // Future coupon support can be integrated here.
    return 0;
};

export const calculateDeliveryCharge = ({ subtotal, threshold = 999, charge = 80 }) => {
    const value = Number(subtotal) || 0;
    return value >= threshold ? 0 : charge;
};

export const calculateGrandTotal = ({ subtotal, discount = 0, deliveryCharge = 0 }) => {
    const s = Number(subtotal) || 0;
    const d = Number(discount) || 0;
    const del = Number(deliveryCharge) || 0;
    return s + del - d;
};

