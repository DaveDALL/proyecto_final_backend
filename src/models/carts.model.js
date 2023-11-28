import mongoose from 'mongoose'
const cartProductSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    qty: {
        type: Number
    }
})
const cartSchema = new mongoose.Schema({
    products: {
        type: [cartProductSchema]
    }
})

cartSchema.pre('findOne', function () {
    this.populate('products.productId')
})

const Cart = mongoose.model('Cart', cartSchema)

export default Cart
