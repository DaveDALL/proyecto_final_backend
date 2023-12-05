import CONFIG from '../../config/config.env.js'
import userService from '../services/user.service.js'
const {PORT} = CONFIG
const { getUserByEmailService, lastConnectionUpdateService } = userService

const userRegistrationViewController = (req, res) => {
    res.render('register', {})
}

const userLoginController = (req, res) => {
    res.render('login', {})
}

const userLogoutController = async (req, res) => {
    try {
        let { userMail } = req.session
        await lastConnectionUpdateService(userMail)
        req.session.destroy (err => {
            if(err) res.send('Problemas con el logout!!')
            res.clearCookie('jwtCookie').redirect('/')
        })
    }catch(err) {

    }
}

const productViewController = (req, res) => {
    let {userName, lastName, userMail, userRoll} = req.session
    res.render('products', {name: userName, lastName: lastName, mail: userMail, roll: userRoll, port: PORT})
}

const cartViewController = (req, res) => {
    res.status(200).render('cart', {port: PORT})
}

const userPassRecoveryViewController = (req, res) => {
    res.render('recovery', {})
}

const uploaderController = async (req, res) =>{
    let { userMail } = req.session
    let user = await getUserByEmailService(userMail)
    let userId = user[0]._id
    res.render('uploads', {userId: userId})
}

const usersAdminController = async (req, res) => {
    res.render('userAdmin', {})
}

export default {
    userRegistrationViewController,
    userLoginController,
    userLogoutController,
    productViewController,
    cartViewController,
    userPassRecoveryViewController,
    uploaderController,
    usersAdminController
}