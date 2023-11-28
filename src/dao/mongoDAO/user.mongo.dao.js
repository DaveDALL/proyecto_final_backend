import User from '../../models/users.model.js'
import Recovery from '../../models/recovery.model.js'
import emailTransport from '../../../config/transport.email.js'

export class UserMongoDAO {

    constructor() {

    }

    async getAllUsers () {
        try {
            let allUsers = await User.find()
            if(allUsers.length > 0) {
                return allUsers
            } else return []
        }catch(err) {
            throw new Error('No se pudo obtener los usuarios en MongoDB con mongoose ', {cause: err})
        }
    }

    async createUser (user) {
        try {
            let createdUser = await User.create(user)
            if(createdUser) {
                return createdUser
            }else return {}
        }catch(err) {
            throw new Error('No se pudo crear el usuario en MongoDB con mongoose ', {cause: err})
        }
    }

    async getUserByEmail (mail) {
        try {
            let foundUser = await User.find({'userMail': mail})
            if(foundUser.length > 0) {
                return foundUser
            }else return []
        }catch(err) {
            throw new Error('No se pudo confirmar el usuario en MongoDB con mongoose ', {cause: err})
        }
    }

    async getUserByCart (cid) {
        try{
            let userByCart = await User.findOne({"cartId": cid})
            if(userByCart) {
                return userByCart
            } else return {}
        }catch(err) {
            throw new Error('No se pudo confirmar el usuario en MongoDB con mongoose ', {cause: err})
        }
    }

    async updateUserRoll (uid, actualRoll) {
        try {
            let updateUserRollResult = {}
            let foundUser = await User.find({_id: uid})
            if(foundUser[0].userRoll === actualRoll && foundUser[0].userRoll !== 'PREMIUM') {
                updateUserRollResult = await User.updateOne({_id: uid}, {$set: {userRoll: 'PREMIUM'}})
            }else if(foundUser[0].userRoll === actualRoll && foundUser[0].userRoll !== 'USUARIO') {
                updateUserRollResult = await User.updateOne({_id: uid}, {$set: {userRoll: 'USUARIO'}})
            } else throw new Error('No fue posible actualizar el roll del usuario en MongoDB con mongoose')
            return updateUserRollResult
        }catch(err) {
            throw new Error('No fue posible actualizar el roll del usuario en MongoDB con mongoose', {cause: err})
        }
    }

    async deleteUserByEmail (mail) {
        try {
            let deleteUserResult = await User.deleteOne({'userMail': mail})
            if(deleteUserResult) {
                return deleteUserResult
            }else return {}
        }catch(err) {
            throw new Error('No fue posible eliminar el usuario en MongoDB con mongoose', {cause: err})
        }
    }

    async verifyLink (link) {
        try {
            let accessLink = await Recovery.findOne({'link': link})
            if(accessLink) {
                let currentTime = Date.now()
                if(accessLink.endTime > currentTime) {
                    return true
                }else {
                    await Recovery.deleteOne({'link': link})
                    return false
                }
            }else return false
        }catch(err) {
            throw new Error('No se puede obtener el link en MongoDB con mongoose', {cause: err})
        }
    }

    async userPassRecovery (email) {
        try {
            let accessData = {
                email,
                link: Date.now().toString(36),
                startTime: Date.now(),
                endTime: Date.now() + 3600000
            }
    
            let accessLink = await Recovery.create(accessData)
            if(accessLink) {
                return accessLink
            } else return {}
        }catch(err) {
            throw new Error('No fue posible crear el Link en MongoDB con mongoose', {cause: err})
        }
    } 

    async sendMail (fromAddress, toAddress, subject, mailBody, attach) {
        try{
            let mailSendResult = await emailTransport.sendMail({
                from: fromAddress,
                to: toAddress,
                subject: subject,
                html: mailBody,
                attachments: attach
            })
    
            return mailSendResult
        }catch(err) {
            throw new Error('No fue posible enviar el correo al usuario', {cause: err})
        }
    }

    async getUserLink (link) {
        try {
            let userLink = Recovery.findOne({'link': link})
            if(userLink) {
                return userLink
            }else return {}
        }catch(err) {
            throw new Error('No fue posible obtener el usuario con el link proporcionado', {cause: err})
        }
    }
    async updateUserPass (uid, newPass) {
        try {
            let updatedUserPassResult = User.updateOne({_id: uid}, {$set: {userPassword: newPass}})
            if(updatedUserPassResult) {
                return updatedUserPassResult
            }else return {}
        }catch {
            throw new Error('No fue posible actualizar la contraseña del usuario', {cause: err})
        }
    }

    async saveDocuments (mail, documents) {
        try {
            let saveDocumentsResult = await User.updateOne({'userMail': mail}, {$set: {documents: documents}})
            if(saveDocumentsResult) {
                return saveDocumentsResult
            } else return {}
        }catch(err) {
            throw new Error('No fue posible almacenar los documentos', {cause: err})
        }
    }

    async lastConnectionUpdate (mail) {
        try {
            await User.findOneAndUpdate({'userMail': mail}, {last_connection: new Date(0)})
        }catch(err) {
            throw new Error('No fue posible actualizar la ultima conexión', {cause: err})
        }
    }
}