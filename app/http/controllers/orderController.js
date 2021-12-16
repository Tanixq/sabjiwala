const Order = require("../../models/order");
const moment = require("moment");
const razorpay = require("../../config/razorpay");
const crypto = require("crypto");

const orderController = () => {
  return {
    async store(req, res) {
      const { phone, address } = req.body;

      if (!phone || !address) {
        res.status(500).send({ error: "All fields are required." });
      }

      try {
        const razorpayOrderId = await razorpay.orders.create({
          amount: req.session.cart.totalPrice * 100,
          currency: "INR",
        });
        const order = new Order({
          customerId: req.user._id,
          items: req.session.cart.items,
          phone,
          address,
          razorpayOrderId: razorpayOrderId.id,
        });
        const options = {
          key: process.env.RAZORPAY_KEY_ID, // Enter the Key ID generated from the Dashboard
          amount: razorpayOrderId.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
          currency: "INR",
          order_id: razorpayOrderId.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
          callback_url: process.env.RAZORPAY_CALLBACK_URL,
        };
        await order.save();
        res.json(options);
      } catch (error) {
        console.log(error);
        res.status(500).send({ error: "Some error occured in server" });
      }
    },
    async index(req, res) {
      try {
        const orders = await Order.find({ customerId: req.user._id }, null, {
          sort: { createdAt: -1 },
        });
        res.render("customers/order", { orders: orders, moment: moment });
      } catch (error) {
        console.log(error);
      }
    },

    async verifyPayment(req, res) {
      const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
        req.body;
      try {
        const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
        hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
        let generatedSignature = hmac.digest("hex");
        let isSignatureValid = generatedSignature == razorpay_signature;
        if (isSignatureValid) {
          await Order.findOneAndUpdate(
            { razorpayOrderId: razorpay_order_id },
            {
              razorpayPaymentId: razorpay_payment_id,
              razorpaySignature: razorpay_signature,
              paymentStatus: "confirmed",
              status: "order_placed"
            }
          );
        }
        req.session.cart = null
        res.redirect("/customers/orders")
      } catch (error) {
        console.log(error);
        res.redirect("/customers/orders")
      }
    },
  };
};

module.exports = orderController;
