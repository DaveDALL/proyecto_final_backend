import Cart from '../../models/carts.model.js'

export class CartMongoDAO {

    constructor() {

    }

    async getCartById (cid) {
        try {
            let cart = await Cart.findOne({_id: cid})
            if(cart){
                return cart
            }else return {}
        }catch(err) {
            throw new Error('No es posible obtener el cart de MongoDB con mongoose ', {cause: err})
        }
    }

    async createCart () {
        try{
            let cartCreatedResult = await Cart.create({
                products: []
            })
            return cartCreatedResult
        }catch(err) {
            throw new Error('No es posible crear el cart en Mongo DB con mongoose ', {cause: err})
        }
    }

    async updateCartById (cid, productId, qty) {
        try {
            let foundCart = await Cart.find({_id: cid})
            let products = foundCart[0].products
            let foundProduct = products.find(product => product.productId.equals(productId))
            if(foundProduct) {
                let updatedCartResult = await Cart.updateOne({_id: cid, 'products.productId': productId}, {$set: {'products.$.qty': qty + foundProduct.qty}})
                return updatedCartResult
            }else {
                let updatedCartResult = await Cart.updateOne({_id: cid}, {$push: {products: {productId: productId, qty: qty}}})
                return updatedCartResult
            }
        }catch(err) {
            throw new Error('No es posible actualizar el cart en MongoDB con mongoose ', {cause: err})
        }
    }

    async deleteProductFromCart (cid, pid) {
        try {
            let foundCart = await Cart.find({_id: cid})
            let products = foundCart[0].products
            let foundProduct = products.find(product => product.productId.equals(pid))
            if(foundProduct) {
                let deletedProductResult = await Cart.updateOne({_id: cid}, {$pull: {products: {productId: pid}}})
                return deletedProductResult
            }
        }catch(err) {
            throw new Error('No es posible borrar el producto en MongoDB com mongoose ', {cause: err})
        }
    }

    async deleteCartbyId (cid) {
        try {
            let deletedCartResult = await Cart.deleteOne({_id: cid})
            return deletedCartResult
        }catch(err) {
            throw new Error('No es posible borrar el cart de MongoDB con mongoose ', {cause: err})
        }
    }
}