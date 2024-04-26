module.exports = (app) => {
    var userHandler = require('../controllers/userController.js');
    app.route('/auth/register').post(userHandler.register);
    app.route('/auth/sign_in').post(userHandler.sign_in);
    app.route('/auth/profile').post(userHandler.profile);
    app.route('/sendMail').post(userHandler.sendMail);
    app.route('/resetPassword').post(userHandler.resetPassword);
}