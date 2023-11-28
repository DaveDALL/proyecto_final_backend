import mongoose from 'mongoose'

const ticketProductSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    qty: {
        type: Number
    },
    subtotal: {
        type: Number
    }
})

const ticketSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
    },
    buyedProducts: {
        type: [ticketProductSchema]
    },
    amount: {
        type: Number,
        required: true,
    },
    purchaser: {
        type: String,
        required: true,
    }
},
{
    timestamps: {
        createdAt: 'purchase_datetime',
        updatedAt: false,
    }
})

ticketSchema.pre('findOne', function () {
    this.populate('buyedProducts.productId')
})

const Ticket = mongoose.model('Ticket', ticketSchema)

export default Ticket