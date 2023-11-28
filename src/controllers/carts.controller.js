import cartService from '../services/carts.service.js'
import productService from '../services/products.service.js'
import CustomizedError from '../utils/errorHandler/errorHandler.customErrors.js'
import EError from '../utils/errorHandler/errorHandler.enums.js'
import { generateErrorInfo } from '../utils/errorHandler/errorHandler.info.js'
const {getCartByIdService, newCartService, updateCartService, delProductFromCartService, deleteCartService, purchaseCartService} = cartService
const { searchProductByIdService } = productService

const getCartByIdController = async (req, res, next) => {
    try {
        let {cid} = req.params
        if(!cid) {
            CustomizedError.createError({
                name: 'Error en el cart',
                cause: generateErrorInfo(EError.CART_INVALID_CID_ERROR, cid),
                message: 'No se cuenta con el parámetro cid para buscar el cart',
                code: EError.CART_INVALID_CID_ERROR
            })
        }
        let cart = await getCartByIdService(cid)
        if(cart) {
            res.status(200).send({status: 'success', payload: cart})
        }else {
            CustomizedError.createError({
                name: 'Error en el cart',
                cause: generateErrorInfo(EError.CART_INVALID_CID_ERROR, cid),
                message: 'No se cuenta con el parámetro correcto cid para buscar el cart',
                code: EError.CART_INVALID_CID_ERROR
            })
        }
    }catch(err) {
        req.logger.warning(`No es posible obtener el cart con el servicio\n${err}\n[code:] ${err.code}\n[casue:] ${err.cause}`)
        next(err)
    }
}

const newCartController = async (req, res, next) => {
    try{
        let cartCreatedResult = await newCartService()
        if(cartCreatedResult) {
            res.status(201).send({status: 'success', payload: cartCreatedResult})
        }else {
            CustomizedError.createError({
                name: 'Error en el cart',
                cause: generateErrorInfo(EError.CART_INVALID_CID_ERROR, cid),
                message: 'No se pudo crear el cart',
                code: EError.CART_INVALID_CID_ERROR
            })
        }
        
    }catch(err) {
        req.logger.error(`No es posible crear el car con el servicio\n${err}\n[code:] ${err.code}\n[casue:] ${err.cause}`)
        next(err)
        res.status(404).send({status: 'error', error: 'No fue posible crear el cart con mongoose'})
    }
}

const updateCartController = async (req, res, next) => {
    try {
        let {cid} = req.params
        let {productId, qty} = req.body
        let updatedCartResult = {}
        if(!cid || !productId || !qty || qty <= 0) {
            CustomizedError.createError({
                name: 'Error en el cart',
                cause: generateErrorInfo(EError.CART_INVALID_DATA_ERROR, {cid, productId, qty}),
                message: 'Los parámetros para actualizar el cart no estan completos',
                code: EError.CART_INVALID_DATA_ERROR
            })
        }
        let foundProductInDb = await searchProductByIdService(productId)
        if(req.user.email === foundProductInDb.owner) {
            CustomizedError.createError({
                name: 'Error al agregar o modificar el producto al Cart',
                cause: generateErrorInfo(EError.CART_INVALID_DATA_ERROR, {cid, productId, qty}),
                message: 'El usuario PREMIUM es el propietario del producto',
                code: EError.CART_INVALID_DATA_ERROR
            })
        } else updatedCartResult = await updateCartService(cid, productId, qty)
        if(updatedCartResult) {
            res.status(202).send({status: 'success', payload: 'Se actualizó el cart con éxito'})
        }else {
            CustomizedError.createError({
                name: 'Error en el cart',
                cause: generateErrorInfo(EError.CART_INVALID_DATA_ERROR, {cid, productId, qty}),
                message: 'Los parámetros para actualizar el cart no estan completos o no son válidos',
                code: EError.CART_INVALID_DATA_ERROR
            })
        }
    }catch(err) {
        req.logger.warning(`No es posible actualizar el car con el servicio\n${err}\n[code:] ${err.code}\n[casue:] ${err.cause}`)
        next(err)
        res.status(404).send({status: 'error', error: 'No fue posible actualizar el cart con mongoose'})
    }
}

const delProductFromCartController = async (req, res, next) => {
    try {
        let {cid, pid} = req.params
        if(!cid || !pid) {
            CustomizedError.createError({
                name: 'Error en el cart',
                cause: generateErrorInfo(EError.CART_INVALID_DATA_ERROR, {cid, pid}),
                message: 'Los parámetros para actualizar el cart no estan completos',
                code: EError.CART_INVALID_DATA_ERROR
            })
        }
        let updatedCartResult = await delProductFromCartService(cid, pid)
        if(updatedCartResult) {
            res.status(200).send({status: 'success', payload: 'El producto se eliminó del cart con éxito'})
        }else {
            CustomizedError.createError({
                name: 'Error en el cart',
                cause: generateErrorInfo(EError.CART_INVALID_DATA_ERROR, {cid, pid}),
                message: 'Los parámetros para actualizar el cart no estan completos o no son válidos',
                code: EError.CART_INVALID_DATA_ERROR
            })
        }
    }catch(err) {
        req.logger.warning(`No es posible borrar el producto con el servicio\n${err}\n[code:] ${err.code}\n[casue:] ${err.cause}`)
        next(err)
        res.status(404).send({status: 'error', error: 'No fue posible eliminar el producto del cart con mongoose'})
    }
}

const deleteCartController = async (req, res, next) => {
    try {
        let {cid} = req.params
        if(!cid) {
            CustomizedError.createError({
                name: 'Error en el cart',
                cause: generateErrorInfo(EError.CART_INVALID_CID_ERROR, cid),
                message: 'No se cuenta con el parámetro cid para buscar el cart',
                code: EError.CART_INVALID_CID_ERROR
            })
        }
        let deletedCartResult = await deleteCartService(cid)
        if(deletedCartResult) {
            res.status(202).send({status: 'success', payload: 'El cart se eliminó con éxito'})
        } else {
            CustomizedError.createError({
                name: 'Error en el cart',
                cause: generateErrorInfo(EError.CART_INVALID_CID_ERROR, cid),
                message: 'No se cuenta con el parámetro cid para borrar el cart',
                code: EError.CART_INVALID_CID_ERROR
            })
        }
    }catch(err) {
        req.logger.warning(`No es posible borrar el cart con el servicio\n${err}\n[code:] ${err.code}\n[casue:] ${err.cause}`)
        next(err)
        res.status(404).send({status: 'error', error: 'No fue posible eliminar el cart con mongoose'})
    }
}

const purchaseCartController = async (req, res, next) => {
    try{
        let {cid} = req.params
        if(!cid) {
            CustomizedError.createError({
                name: 'Error en el cart',
                cause: generateErrorInfo(EError.CART_INVALID_CID_ERROR, cid),
                message: 'No se cuenta con el parámetro cid para buscar el cart',
                code: EError.CART_INVALID_CID_ERROR
            })
        }
        let purchaseOrder = await purchaseCartService(cid)
        if(purchaseOrder) {
            res.status(202).send({status: 'success', payload: purchaseOrder})
        }else {
            CustomizedError.createError({
                name: 'Error en el cart',
                cause: generateErrorInfo(EError.CART_INVALID_CID_ERROR, cid),
                message: 'No se cuenta con el parámetro correcto cid para buscar el usuario',
                code: EError.CART_INVALID_CID_ERROR
            })
        }
    }catch(err) {
        req.logger.warning(`No es posible crear el ticket con el servicio\n${err}\n[code:] ${err.code}\n[casue:] ${err.cause}`)
        next(err)
        res.status(404).send({status: 'error', error: 'No fue posible crear el ticket con mongoose'})
    }
}

export default {
    getCartByIdController,
    newCartController,
    updateCartController,
    delProductFromCartController,
    deleteCartController,
    purchaseCartController
}
