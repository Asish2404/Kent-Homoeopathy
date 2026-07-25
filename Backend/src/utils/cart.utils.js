export const calculateSubtotal = (items) => {
    if (!Array.isArray(items)) return 0;

    return items.reduce((sum, item) => {
        const quantity = Number(item.quantity) || 0;
        const price = Number(item.product?.price ?? item.product?.discount_price) || 0;
        return sum + quantity * price;
    }, 0);
};

export const calculateDiscount = () => {
    return 0;
};

export const calculateDeliveryCharge = ({
    subtotal,
    threshold = 499,
    charge = 49,
    kentDiscount = 0,
}) => {
    const value = Number(subtotal) || 0;
    const base = value >= threshold ? 0 : charge;
    return Math.max(0, base - Number(kentDiscount || 0));
};

export const calculateGrandTotal = ({
    subtotal,
    discount = 0,
    deliveryCharge = 0,
}) => {
    const s = Number(subtotal) || 0;
    const d = Number(discount) || 0;
    const del = Number(deliveryCharge) || 0;

    return s + del - d;
};

export const calculateCartTotals = (cartItems) => {
    if (!Array.isArray(cartItems)) {
        return {
            totalItems: 0,
            subtotal: 0,
        };
    }

    const totalItems = cartItems.reduce(
        (sum, item) => sum + (Number(item.quantity) || 0),
        0
    );

    const subtotal = calculateSubtotal(cartItems);

    return {
        totalItems,
        subtotal,
    };
};