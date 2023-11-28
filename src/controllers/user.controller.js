import userService from '../services/user.service.js'
import CustomizedError from '../utils/errorHandler/errorHandler.customErrors.js'
import EError from '../utils/errorHandler/errorHandler.enums.js'
import { generateErrorInfo } from '../utils/errorHandler/errorHandler.info.js'
const { getUserByEmailService, updateUserRollService, userMailPassRecoveryService, userLinkVerifyService, userPassChangeService, documentsService, getAllUsersService, delNotActivityUsersService, delUserByEmailService } = userService

const getAllUsersController = async (req, res, next) => {
    try {
        let allUsers = await getAllUsersService()
        if(allUsers.length > 0) {
            res.status(200).send({status: 'success', payload: allUsers})
        } else res.status(400).send({status: 'error', error: 'No fue posible obtener los usuarios completos'})
    }catch(err) {
        req.logger.warning(`No es posible obtener los usuarios con el servicio`)
        next(err)
    }
}

const getUserByEmailController = async (req, res, next) => {
    try{
        let {mail} = req.body
        if(!mail) {
            CustomizedError.createError({
                name: 'Error en el usuario',
                cause: generateErrorInfo(EError.USER_MAIL_ERROR, mail),
                message: 'No se cuenta con el parámetro para buscar el usuario',
                code: EError.USER_MAIL_ERROR
            })
        }
        let getUserResult = await getUserByEmailService(mail)
        if(getUserResult.length > 0) {
            res.status(200).send({status: 'success', payload: getUserResult})
        }else {
            CustomizedError.createError({
                name: 'Error en el usuario',
                cause: generateErrorInfo(EError.USER_MAIL_ERROR, mail),
                message: 'No se cuenta con el parámetro correcto para buscar el usuario',
                code: EError.USER_MAIL_ERROR
            })
        }
        
    }catch(err) {
        req.logger.warning(`No es posible obtener al usuario con el servicio`)
        next(err)
    }
}

const delNotActivityUserController = async (req, res, next) => {
    try {
        let deletedUsers = await delNotActivityUsersService()
        if(deletedUsers.length > 0) {
            res.status(201).send({status: 'success', payload: deletedUsers})
        } else res.status(400).send({status: 'error', error: 'No se encoentraron usuarios sin actividad'})
    }catch(err) {
        req.logger.warning(`No es posible eliminar usuarios sin actividad con el servicio`)
        next(err)
    }
}

const updateUserRollController = async (req, res, next) => {
    try{
        let {uid} = req.params
        if(!uid) {
            CustomizedError.createError({
                name: 'Error al actualiza el usuario en el usuario',
                cause: generateErrorInfo(EError.USER_INVALID_DATA_ERROR, uid),
                message: 'No se cuenta con el parámetro para actualizar el usuario',
                code: EError.USER_INVALID_DATA_ERROR
            })
        }
        let updateUserResult = await updateUserRollService(uid, req.user.email, req.user.roll)
        console.log(updateUserResult)
        if(updateUserResult) {
            return res.status(200).send({status: 'success', payload: updateUserResult})
        } else return res.status(400).send({status: 'Error', error: 'No se cuentan con los documentos para realizar el cambio a Premium'})
    }catch(err) {
        req.logger.warning(`No es posible actualizar el roll del usuario con el servicio`)
        next(err)
    }
}

const userMailPassRecoveryController = async (req, res, next) => {
    try {
        let { email } = req.body
        if(!email) {
            CustomizedError.createError({
                name: 'Error al recuperar el usuario',
                cause: generateErrorInfo(EError.USER_INVALID_DATA_ERROR, email),
                message: 'No se cuenta con el parámetro para recuperar el usuario',
                code: EError.USER_INVALID_DATA_ERROR
            })
        }
        let mailSendResult = userMailPassRecoveryService(email)
        if(!mailSendResult){
            res.status(400).send({status:'error', error:'No fue posible enviar el correo de recuperación'})
        }
        res.status(200).send({status: 'success', payload: 'correo enviado exitosamente'})
    }catch(err) {
        req.logger.warning(`No es posible enviar el correo con el servicio`)
        next(err)
    }

}

const userPassLinkRecoveryController = async (req, res, next) => {
    try {
        let {link} = req.params
        if(!link) {
            CustomizedError.createError({
                name: 'Error al recuperar el usuario',
                cause: generateErrorInfo(EError.USER_INVALID_DATA_ERROR, email),
                message: 'No se cuenta con el link para recuperar el usuario',
                code: EError.USER_INVALID_DATA_ERROR
            })
        }
        let linkVerify = await userLinkVerifyService(link)
        if(linkVerify) {
            res.render('passChange', {link: link, changeMessage: ""})
        }else {
            res.render('recovery', (err, html) => {
                html='No esta autorizado para realizar la recuperación de contraseña'
                res.status(401).send({status: 'error', error: html})
            })
        }
    }catch(err) {
        req.logger.warning(`No es posible verificar el link para cambio de contraseña con el servicio`)
        next(err)
    } 
}

const userPassChangeController = async (req, res, next) => {
    try{
        let { passLink, userPassChangeMain, userPassChangeSecond } = req.body
        let updatedUserPassResult = await userPassChangeService(passLink, userPassChangeMain, userPassChangeSecond)
        if(!updatedUserPassResult) {
            CustomizedError.createError({
                name: 'Error al recuperar el usuario',
                cause: generateErrorInfo(EError.USER_INVALID_DATA_ERROR, passLink),
                message: 'No fue posible validar la contraseña y la confirmación de contraseña correctamente',
                code: EError.USER_INVALID_DATA_ERROR
            })
            res.render('passChange', {link: passLink, changeMessage: "No es posible actualizar la contraseña, intentelo nuevamente"})
        }else {
            switch(updatedUserPassResult) {
                case '-1':
                    res.render('passChange', {link: passLink, changeMessage: "No fue posible actualizar la contraseña, intentelo nuevamente"})
                    break
                case '0':
                    res.render('passChange', {link: passLink, changeMessage: "La contraseña introducida ya fue usada anteriormente"})
                    break
                case '1':
                    res.render('login', (err, html) => {
                        html = 'La contraseña de actualizo con éxito'
                        res.status(200).send({status: 'success', payload: html})
                    })
                    break
                default:
                    res.render('passChange', {link: passLink, changeMessage: "Hubo un error actualizar la contraseña, intentelo nuevamente"})
            }
        }
    }catch {

    }
}

const uploadDocsController = async (req, res, next) => {
    let { userMail } = req.session
    if(!req.files) {
        CustomizedError.createError({
            name: 'Error al subir los documentos',
            cause: generateErrorInfo(EError.USER_INVALID_DATA_ERROR, 'Error al subir docuemntos'),
            message: 'No fue posible subir sus documentos correctamente',
            code: EError.USER_INVALID_DATA_ERROR
        })
        return res.status(400).send({status: 'Error', error: 'No fue posible subir los docuemntos'})
    }else {
        try {
            let documents = [
                {docName: req.files.idDocument[0].filename, reference: req.files.idDocument[0].destination},
                {docName: req.files.addressProof[0].filename, reference: req.files.addressProof[0].destination},
                {docName: req.files.accountStatement[0].filename, reference: req.files.accountStatement[0].destination}
            ]
            let documentsResult = await documentsService(userMail, documents)
            if(documentsResult) {
                return res.status(201).send({status: 'Success', payload: 'Los documentos se almacenaron con éxito'})
            } else return res.status(400).send({status: 'Error', error: 'No fue posible almacenar los docuemntos'})
        }catch(err) {
            req.logger.warning(`No es posible subir sus documentos con el servicio`)
            next(err)
        }
    }

}

const delUserByEmailController = async (req, res, next) => {
    try {
        let {email} = req.body
        let delUserResult = await delUserByEmailService(email)
        if(delUserResult) {
            return res.status(200).send({status: 'success', payload: 'Usuario eliminado con éxito'})
        } else {
            return res.status(400).send({estatus: 'error', error: 'No fue posible eliminar el usuario con el servicio'})
        }
    }catch(err) {
        req.logger.warning(`No es posible elimina el usuario con el servicio`)
        next(err)
    }
}

export default {
    getUserByEmailController,
    updateUserRollController,
    userMailPassRecoveryController,
    userPassLinkRecoveryController,
    userPassChangeController,
    uploadDocsController, 
    getAllUsersController,
    delNotActivityUserController,
    delUserByEmailController
}