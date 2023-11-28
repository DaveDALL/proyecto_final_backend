import mongoose from "mongoose";
import userModel from '../src/models/users.model.js'
import productModel from '../src/models/products.model.js'
import cartModel from '../src/models/carts.model.js'

after(async () => {
    await mongoose.connection.close()
})

export const dropUsers = async () => {
    await userModel.collection.drop()
}

export const dropProducts = async () => {
    await productModel.collection.drop()
}

export const dropCarts = async () => {
    await cartModel.collection.drop()
}

export const createCart = async () => {
    return await cartModel.create({
        products: []
    })
}