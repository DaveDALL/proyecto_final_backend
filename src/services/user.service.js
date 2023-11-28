import DAOS from '../dao/daos.factory.js'
import logger from '../utils/logging/factory.logger.js'
import CONFIG from '../../config/config.env.js'
import encrypt from '../../config/bcrypt.js'
const { UserDAO } = DAOS
const { EMAIL_USER, PORT } = CONFIG
const { passHashing, validatePass } =encrypt

const getAllUsersService = async () => {
    try {
        let allUsers = await UserDAO.getAllUsers()
        if(allUsers.length > 0) {
            return allUsers
        } else {
            logger.debug('No fue posible los usuarios en MongoDB')
            return []
        }
    }catch(err) {
        throw new Error('Error al obtener los usuarios con mongoose ', {cause: err})
    }
}

const delNotActivityUsersService = async () => {
    try {
        let allUsers = await UserDAO.getAllUsers()
        let deletedUsers = allUsers.map(async (user, index) => {
            if((Date.now() - user[index].last_connection) > 1.728e8) {
                await UserDAO.deleteUserByEmail(user[index].userMail)
                let mailInfo = {
                    subject: 'Eliminación de Cuenta por Inactividad',
                    mailBody: `
                        <h3>Eliminación de Cuenta por Inactividad</h3>
                        <p>\n\nEstimado usuario ${user[index].userMail}, enviamos la siguiente notificación para informar que su cuenta se ha eliminado por inactividad\n\n</p>
                        <p>\n\nSin más por el momento enviamos saludos cordiales.</p>
                        <p>\n\nAtte.\n\n</p>
                        <h4>SuperArticulos</h4>
                    `,
                    attach: []
                }
                await UserDAO.sendMail(EMAIL_USER, user[index].userMail, mailInfo.subject, mailInfo.mailBody, mailInfo.attach)
                return user[index]
            }
        })
        if(deletedUsers.length > 0) {
            return deletedUsers
        } else return []
    }catch(err) {
        throw new Error('Error al eliminar usuarios sin actividad con mongoose ', {cause: err})
    }
}

const getUserByEmailService = async (mail) => {
    try {
        let getUserResult = await UserDAO.getUserByEmail(mail)
        if(getUserResult.length > 0) {
            return getUserResult
        } else {
            logger.debug('No fue posible encontrar el usuario en MongoDB')
            return []
        }
    }catch(err) {
        throw new Error('Error al obtener al usuario con mongoose ', {cause: err})
    }
}

const updateUserRollService = async (uid, email, actualRoll) => {
    try{
        let user = await UserDAO.getUserByEmail(email)
        let documents = user[0].documents
        console.log(documents)
        if(documents.length < 3 && actualRoll == 'USUARIO') {
            logger.warning('No se cuenta con todos los documentos requeridos')
            return null
        } else {
            let updateUserResult = await UserDAO.updateUserRoll(uid, actualRoll)
            if(updateUserResult) {
                return updateUserResult
            }else {
                logger.debug('No fue posible actualizar el usuario en MongoDB')
                return null
            }
        }
    }catch(err) {
        throw new Error('Error al actualizar el roll del usuario con mongoose ', {cause: err})
    }
}

const userMailPassRecoveryService = async (toAddress) => {
    try {
        let userfound = await UserDAO.getUserByEmail(toAddress)

    if(userfound.length > 0) {
      
        let passRecovery = await UserDAO.userPassRecovery(toAddress)

        let subject = 'Recuperación de Contraseña'
        let mailBody = `
            <h3>Correo de Recuperación de contraseña</h3>
            <p>\n\nEstimado usuario ${toAddress}, enviamos la siguiente notificación con el botón de recuperación de tu contraseña\n\n</p>
            <form action="http://localhost:${PORT}/api/users/recoveryPassLink/${passRecovery.link}" method="get">
                <input type="submit" value="Restablecer Contraseña">
            </form>
            <p>\n\nSin más por el momento enviamos saludos cordiales.</p>
            <p>\n\nAtte.\n\n</p>
            <h4>SuperArticulos</h4>
        `
        let attach = []

        await UserDAO.sendMail(EMAIL_USER, toAddress, subject, mailBody, attach)

        return 'Email con recuperación enviado'
    }else {
        logger.warning('El usuario no se encuentra registrado')
        return null
    }
        
    
    }catch(err) {
        logger.warning('No fue posible enviar con correo con el servicio')
        throw new Error('No fue posible enviar el correo con el servicio', {cause: err})
    }
    
}

const userLinkVerifyService = async (link) => {
    let verifyLinkResult = await UserDAO.verifyLink(link)
    if(verifyLinkResult) {
        return true
    }else return false
}

const userPassChangeService = async (link, userPassMain, userPassSecond) => {
    try {
        if(userPassMain !== userPassSecond) {
            return null
        }else {
            let userLink = await UserDAO.getUserLink(link)
            if(!userLink) {
                throw new Error('No es posible recuperar el usuario con link proporcionado')
            }else {
                let user = await UserDAO.getUserByEmail(userLink.email)
                let isValidPass = validatePass(userPassMain, user[0].userPassword)
                if(isValidPass) {
                    return '0'
                }else {
                    let newUserPass = passHashing(userPassMain)
                    let updateUserPassResult = await UserDAO.updateUserPass(user[0]._id, newUserPass)
                    if(updateUserPassResult) {
                        return '1'
                    }else return '-1'
                }
            }
        }
    }catch(err) {
        logger.warning('No fue posible actualizar la contraseña con el servicio')
        throw new Error('No fue posible actualizar la contraseña con el servicio', {cause: err})
    }
}

const documentsService = async (mail, documents) => {
    try {
        let saveDocumentsResult = await UserDAO.saveDocuments(mail, documents)
        if(saveDocumentsResult) {
            return saveDocumentsResult
        } else {
            logger.debug('No fue posible almacenar los documentos en MongoDB')
            return {}
        }
    }catch(err) {
        logger.warning('No fue posible almacenar los documentos en MongoDB con el servicio')
        throw new Error('No fue posible almacenar los documentos en MongoDB con el servicio', {cause: err})
    }
}

const lastConnectionUpdateService = async (mail) => {
    try {
        await UserDAO.lastConnectionUpdate(mail)
    }catch(err) {
        logger.warning('No fue posible hacer logout de usuario con el servicio')
        throw new Error('No fue posible hacer logout de usuario con el servicio', {cause: err})
    }
}

const delUserByEmailService = async (mail) => {
    try {
        let deletedUser = await UserDAO.deleteUserByEmail(mail)
        if(deletedUser) {
            return deletedUser
        } else return {}
    }catch(err) {
        logger.warning('No fue posible hacer logout de usuario con el servicio')
        throw new Error('No fue posible hacer logout de usuario con el servicio', {cause: err})
    }
}

export default {
    getUserByEmailService,
    updateUserRollService,
    userMailPassRecoveryService,
    userLinkVerifyService,
    userPassChangeService,
    documentsService,
    lastConnectionUpdateService,
    getAllUsersService,
    delNotActivityUsersService,
    delUserByEmailService
}