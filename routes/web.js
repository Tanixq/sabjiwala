const homeController = require('../app/http/controllers/homeController')
const authController = require('../app/http/controllers/authController')
const cartController = require('../app/http/controllers/customers/cartController')
const orderController = require('../app/http/controllers/orderController')
const adminOrderController = require('../app/http/controllers/admin/orderController')
const guest = require('../app/http/middlewares/guest')
const auth = require('../app/http/middlewares/auth')
const adminAuth = require('../app/http/middlewares/admin/auth')
const passport = require("passport");

const initRoutes = (app) => {

    app.get('/', homeController().index )
    
    app.get('/login', guest, authController().login )
    app.post('/login', guest, authController().postLogin )

    app.get(
        "/user/auth/google",
        guest,
        passport.authenticate("google", { scope: ["profile", "email"] })
      );
      
      app.get(
        "/user/auth/google/callback",
        guest,
        passport.authenticate("google", { failureRedirect: "/register" }),
        (req, res) => {
            res.redirect("/")
        }
      );

    app.get('/logout', auth, authController().logout )
    
    app.get('/register', guest, authController().register )
    app.post('/register', guest, authController().postRegister )

    app.get('/cart', cartController().index )
    app.post('/update-cart', cartController().update )

    app.post('/order-now', auth, orderController().store )
    app.get('/customers/orders', auth, orderController().index )

    app.post('/orders/payment-capture', auth, orderController().verifyPayment)

    //Admin Routes
    app.get('/admin/orders', adminAuth, adminOrderController().index )
    app.post('/admin/update-order', adminAuth, adminOrderController().adminUpdateOrder )
}

module.exports = initRoutes
