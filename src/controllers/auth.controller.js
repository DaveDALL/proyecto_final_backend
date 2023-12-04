import authService from '../services/auth.service.js'
import CustomizedError from '../utils/errorHandler/errorHandler.customErrors.js'
import EError from '../utils/errorHandler/errorHandler.enums.js'
import { generateErrorInfo } from '../utils/errorHandler/errorHandler.info.js'
const {authRegistrationService, authLoginService} = authService

const authRegistrationController = async (req, res, next) => {
    try {
        let user = req.body
        if(!user.userName || !user.lastName || !user.userMail || !user.userPassword) {
            CustomizedError.createError({
                name: 'Error de registro al crear el usuario',
                cause: generateErrorInfo(EError.USER_REGISTRATION_DATA_ERROR, user),
                message: 'Falla en los datos de las propiedades al crear el usuario durante el registro',
                code: EError.USER_REGISTRATION_DATA_ERROR
            })
        }else {
            await authRegistrationService(user)
            res.redirect('/')
        }
    }catch(err) {
        next(err)
        req.logger.error(`No fue posible crear el usuario en la base de datos\n${err}\n[code:] ${err.code}\n[casue:] ${err.cause}`)
       
    }
}

const authLoginController = async (req, res) => {
    try {
        let user = req.body
        if(!user.userMail || !user.userPassword) {
            CustomizedError.createError({
                name: 'Error de autenticación del usuario',
                cause: generateErrorInfo(EError.USER_INVALID_DATA_ERROR, user),
                message: 'El correo electronico o la contraseña no son validos',
                code: EError.USER_INVALID_DATA_ERROR
            })
        }
        let userInfo = await authLoginService(user)
        let {token, foundUser} = userInfo
        if(userInfo) {
            req.session.userMail = foundUser.userMail
            req.session.userName = foundUser.userName
            req.session.lastName = foundUser.lastName || ' '
            req.session.userRoll = foundUser.userRoll
            res.status(200).cookie('jwtCookie', token).redirect('/products')
        }else res.status(400).redirect('/')
    }catch(err) {
        res.status(401).redirect('/userRegistration')
        req.logger.warning(`No fue posible inciar sesión con los datos del usuario`)   
    }
}

export default {
    authRegistrationController,
    authLoginController
}