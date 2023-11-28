import jwt from 'jsonwebtoken'
import DAOS from '../dao/daos.factory.js'
import encrypt from '../../config/bcrypt.js'
import config from '../../config/config.env.js'
import logger from '../utils/logging/factory.logger.js'
import { UserDTO } from '../dto/user.dto.js'
const { passHashing, validatePass } =encrypt
const { UserDAO, CartDAO } = DAOS
const { SECRET, ADMIN_NAME, ADMIN_MAIL, ADMIN_PASS, ADMIN_ROLL } = config

let adminUser = {
    userName: ADMIN_NAME,
    userMail: ADMIN_MAIL,
    userPassword: ADMIN_PASS,
    userRoll: ADMIN_ROLL
}

const authRegistrationService = async (user) => {
    let {userName, lastName, userMail, userPassword} = user
    try {
        if(userName && lastName && userMail && userPassword) {
            let foundUser = await UserDAO.getUserByEmail(userMail)
            if(foundUser.length <= 0) {
                let hashedPassword = passHashing(userPassword)
                let createdCart = await CartDAO.createCart()
                let createdUser = {
                    userName,
                    lastName,
                    userMail,
                    userPassword: hashedPassword,
                    cartId: createdCart._id,
                    userRoll: 'USUARIO'
                }
                let createdUserResult = await UserDAO.createUser(createdUser)
                if(createdUserResult) {
                    return createdUserResult
                }else {
                    logger.debug('No se pudo crear el usuario en MongoDB')
                    return {}
                }
            }else {
                logger.debug('El usuario ya existe en la base de datos')
                throw new Error('El usuario ya existe en la base de datos')
            }
        }
    }catch(err) {
        logger.error(`No se pudo crear el usuario con mongoose ${err}`)
    }
}

const authLoginService = async (user) => {
    let {userMail, userPassword} = user
    let foundUser = {}
    let isValidPass = false
    try {
        if(userMail === ADMIN_MAIL && userPassword === ADMIN_PASS) {
            foundUser = [adminUser]
            isValidPass = true
        }else {
            foundUser = await UserDAO.getUserByEmail(userMail)
            isValidPass = validatePass(userPassword, foundUser[0].userPassword)
        }
        if(foundUser.length > 0) {
            if(isValidPass) {
                let token = jwt.sign({email: foundUser[0].userMail, roll: foundUser[0].userRoll},
                    SECRET,
                    {expiresIn:'24h'})
                let DTOUser = new UserDTO(foundUser)
                let modifiedUser = DTOUser.userDTO()
                let userInfo = {token: token, foundUser: modifiedUser}
                return userInfo
            } else {
                logger.debug('No se puedo validar el usuario')
                throw new Error('No fue posible validar el usuario ')
            }
        }else {
            logger.debug('El usuario no se encuentra registrado')
            throw new Error('El usuario no se encuentra registrado')
        }
        
    }catch(err) {
        logger.error(`No se pudo confirmar el usuario con mongoose ${err}`)
        throw new Error('No se pudo confirmar el usuario con mongoose ', {cause: err})
    }
}

export default {
    authRegistrationService,
    authLoginService
}