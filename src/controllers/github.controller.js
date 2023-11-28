import jwt from 'jsonwebtoken'
import config from '../../config/config.env.js'
import CustomizedError from '../utils/errorHandler/errorHandler.customErrors.js'
import EError from '../utils/errorHandler/errorHandler.enums.js'
import { generateErrorInfo } from '../utils/errorHandler/errorHandler.info.js'
const { SECRET } = config

const githubController = async (req, res) => {
    try {
        let {userMail, userName, lastName, userRoll} = await req.user
        if(!userMail) {
            CustomizedError.createError({
                name: 'Error de usuario de github',
                cause: generateErrorInfo(EError.USER_GITHUB_DATA_ERROR, {userMail}),
                message: 'Falla en los datos de las propiedades al autentificar mediante github',
                code: EError.USER_GITHUB_DATA_ERROR
            })
        }else {
            req.session.userMail = userMail
            req.session.userName = userName
            req.session.lastName = lastName || ' '
            req.session.userRoll = userRoll
            let token = jwt.sign({mail: userMail, roll: userRoll}, SECRET, {expiresIn:'24h'})
            if(token) return token 
            else throw new Error('No fue posible autentificar con github')
        }
    }catch(err) {
        res.redirect('/')
        req.logger.warning('No es posible autentificar con guthub')
    }
}

export default {
    githubController
}