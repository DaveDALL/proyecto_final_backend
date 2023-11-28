import mongoose from 'mongoose'

const documentSchema = new mongoose.Schema({
    docName: {
        type: String
    },
    reference: {
        type: String
    }
})

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        trim: true,
        required: true,
    },
    lastName: {
        type: String,
        trim: true,
    },
    userMail: {
        type: String,
        trim: true,
        required: true,
        unique: true,
    },
    userPassword: {
        type: String,
        trim: true,
    },
    cartId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cart'
    },
    userRoll : {
        type: String,
        required: true,
    },
    documents: {
        type: [documentSchema]
    }
},
{
    timestamps: {
        createdAt: 'creation_date',
        updatedAt: 'last_connection',
    }
},
{
    strictPopulate: false
})

userSchema.pre('findOne', function () {
    this.populate('cartId').populate({
        path: 'cartId',
        populate: [
            {path: 'products.productId'}
        ]
    })
})

const User = mongoose.model('User', userSchema)

export default User