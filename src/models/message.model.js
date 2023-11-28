import mongoose from 'mongoose'

const messageTypeSchema = new mongoose.Schema({
    user: {
        type: String
    },
    message: {
        type: String
    }
})
const messageSchema = new mongoose.Schema({
    messages: {
        type: [messageTypeSchema]
    }
})

const Message = mongoose.model('Message', messageSchema)

export default Message