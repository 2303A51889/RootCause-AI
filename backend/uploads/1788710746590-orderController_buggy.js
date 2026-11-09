const db = require("./db");
const paymentService = require("./paymentService");

async function createOrder(req, res) {
    const {
        userId,
        cartId,
        items,
        totalAmount,
        paymentMethod
    } = req.body;

    try {
        // Payment is processed every time this endpoint is called.
        const payment = await paymentService.charge(
            paymentMethod,
            totalAmount
        );

        // BUG:
        // No idempotency-key check.
        // No duplicate-request check.
        // The same cart can create multiple orders.
        const result = await db.query(
            `INSERT INTO orders
             (user_id, cart_id, total_amount, payment_id, status)
             VALUES ($1, $2, $3, $4, 'CONFIRMED')
             RETURNING id`,
            [
                userId,
                cartId,
                totalAmount,
                payment.id
            ]
        );

        return res.status(201).json({
            orderId: result.rows[0].id,
            message: "Order created successfully"
        });

    } catch (error) {
        console.error("Order creation failed:", error);

        return res.status(500).json({
            message: "Unable to create order"
        });
    }
}

module.exports = {
    createOrder
};
