const express = require('express');
const router = express.Router();
const signIn = require('../controllers/user/signIn');
const signUp = require('../controllers/user/signUp');
const forgotPassword = require('../controllers/user/forgotPassword');
const sessionCheck = require('../middlewares/users/sessionCheck');
const signOut = require('../controllers/user/signOut');
const profile = require('../controllers/user/profile');
const imageUpload = require('../utilities/imageUpload');
const imageProcessor = require('../utilities/imageProcessor');
const address = require('../controllers/user/address');
const cart = require('../controllers/user/cart');
const wishlist = require('../controllers/user/wishlist');
const checkOut = require('../controllers/user/checkOut');
const orders = require('../controllers/user/orders');
const review = require('../controllers/user/review');


// ========================== SIGN IN ==============================
router
      .route('/signIn')
      .get(signIn.signInPage)
      .post(signIn.signInVerification);


// ========================== SIGN UP ==============================
router
      .route('/signUp')
      .get(signUp.signUpPage)
      .post(signUp.registerUser);

router.get('/signUp/resendOTP', signUp.resendOTP);


// ========================== OTP =================================
router
      .route('/otp_verification')
      .get(signUp.otpPage)
      .post(signUp.otpVerification);


// ================= PASSWORD HANDLERS =============================
router
      .route('/forgotPassword')
      .get(forgotPassword.forgotPasswordPage)
      .post(forgotPassword.emailVerification);

router
      .route('/forgotPassword/otpVerification')
      .get(forgotPassword.otpPage)
      .post(forgotPassword.otpVerification);

router
      .route('/changePassword')
      .get(forgotPassword.passwordChangePage)
      .post(forgotPassword.updatePassword);


// ================= USER PROFILE =================================
router
      .route('/profile')
      .get(sessionCheck, profile.profilePafge)
      .post(
            sessionCheck,
            imageUpload.single('croppedImage'),
            imageProcessor.profilePic,
            profile.updateProfile
      );


// ================= USER ADDRESSES ================================
router.get('/addresses', sessionCheck, address.viewAll);
router.post('/addresses/addNew', sessionCheck, address.addNewAddress);
router.post('/addresses/editAddress', sessionCheck, address.editAddress);
router.get('/addresses/delete', sessionCheck, address.deleteAddress);
router.get('/addresses/changeRole', sessionCheck, address.defaultToggler);


// ================= CART MANAGEMENT ===============================
router
      .route('/cart')
      .get(sessionCheck, cart.viewAll)
      .post(cart.addToCart)
      .delete(sessionCheck, cart.remove);

router
      .route('/cart/count')
      .put(sessionCheck, cart.addCount)
      .delete(sessionCheck, cart.reduceCount);


// ================= WISH LIST ====================================
router
      .route('/wishlist')
      .patch(wishlist.addOrRemove)
      .get(sessionCheck, wishlist.viewAll)
      .delete(wishlist.remove);


// ================== CHECKOUT & PAYMENT ===========================
// checkout page + coupon apply + order init
router
      .route('/cart/checkout')
      .get(sessionCheck, checkOut.view)
      .put(sessionCheck, checkOut.coupon)
      .post(sessionCheck, checkOut.checkOut);

// change default address
router.post('/cart/checkout/changeDefaultAddress', sessionCheck, checkOut.defaultAddress);

// verify Razorpay payment
router.post('/cart/checkout/verifyPayment', sessionCheck, checkOut.verifyPayment);

// order result page
router.get('/cart/checkout/:id', sessionCheck, checkOut.result);


// ================= ORDERS ========================================
router.get('/orders', sessionCheck, orders.viewAll);
router
      .route('/orders/:id')
      .get(sessionCheck, orders.viewOrderDetails)
      .patch(sessionCheck, orders.cancelOrder);
router.post('/orders/return', sessionCheck, orders.returnOrder);


// ================= REVIEWS =======================================
router
      .route('/reviews')
      .post(sessionCheck, review.addNew)
      .patch(sessionCheck, review.helpful);


// ================= SIGN OUT ======================================
router.get('/signOut', sessionCheck, signOut.signOut);

module.exports = router;
