import mongoose from 'mongoose'

const recoverySchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true
    },
    startTime: {
        type: Number,
        required: true
    },
    endTime: {
        type: Number,
        required: true
    }
})

const Recovery = mongoose.model('Recovery', recoverySchema)

export default Recovery