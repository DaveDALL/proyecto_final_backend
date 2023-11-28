import Message from '../../models/message.model.js'

export class MessageMongoDAO {
    constructor () {

    }

    async createMessage (allMessages) {
        try {
            let createdMessage = await Message.create({messages: allMessages})
            return createdMessage
        }catch(err) {
            throw new Error('No se pudo crear el mensaje de chat en MongoDB con mongoose ', {cause: err})
        }
    }

    async updateMessage (id, allMessages) {
        try {
            let updatedMessage = await Message.updateOne({_id: id}, {messages: allMessages})
                return updatedMessage
        }catch(err) {
            throw new Error('No se pudo actualizar el mensaje del chat en MongoDB con mongoose ', {cause: err})
        }
    }

}