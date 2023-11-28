import productService from '../services/products.service.js'
import CustomizedError from '../utils/errorHandler/errorHandler.customErrors.js'
import EError from '../utils/errorHandler/errorHandler.enums.js'
import { generateErrorInfo } from '../utils/errorHandler/errorHandler.info.js'
const {conditionalSearchProductsService, searchProductByIdService, newProductService, productUpdateService, deleteProductService} = productService

const conditionalSearchProductsController = async (req, res) => {
    let conditions = req.query
    try {
        let requiredProducts = await conditionalSearchProductsService(conditions)
        let {totalPages, prevPage, nextPage, page, hasPrevPage, hasNextPage} = requiredProducts
        let prevPageLink = (prevPage ? (req.protocol + '://' + req.get('host') + req.originalUrl.replace(`pageNum=${page}`, `pageNum=${Number(page) - 1}`)) : null)
        let nextPageLink = (nextPage ? (req.protocol + '://' + req.get('host') + req.originalUrl.replace(`pageNum=${page}`, `pageNum=${Number(page) + 1}`)) : null)

        res.status(200).send({
            status: 'success',
            payload: requiredProducts.docs,
            totalPages,
            prevPage,
            nextPage,
            page,
            hasPrevPage,
            hasNextPage,
            prevLink: prevPageLink,
            nextLink: nextPageLink
        })
    }catch(err) {
        req.logger.warning(`No es posible obtener los productos desde el servicio de productos\n${err}\n[code:] ${err.code}\n[casue:] ${err.cause}`)
        res.status(404).send({status: 'error', error: 'No es posible obtener productos con mongoose'})
    }
}

const searchProductByIdController = async (req, res, next) => {
    try {
        let {pid} = req.params
        if(!pid) {
            CustomizedError.createError({
                name: 'Error en el producto',
                cause: generateErrorInfo(EError.PRODUCT_INVALID_PID_ERROR, pid),
                message: 'No se cuenta con el parámetro pid para buscar el producto',
                code: EError.PRODUCT_INVALID_PID_ERROR
            })
        }
        let foundProduct = await searchProductByIdService(pid)
        if(foundProduct) {
            res.status(200).send({status: 'success', payload: foundProduct})
        }else {
            CustomizedError.createError({
                name: 'Error en el producto',
                cause: generateErrorInfo(EError.PRODUCT_INVALID_PID_ERROR, pid),
                message: 'No se cuenta con el parámetro correcto pid para buscar el producto',
                code: EError.PRODUCT_INVALID_PID_ERROR
            })
        }
    }catch(err) {
        req.logger.warning(`No es posible buscar los productos\n${err}\n[code:] ${err.code}\n[casue:] ${err.cause}`)
        next(err)
        res.status(404).send({status: 'error', error: 'No es posible obtener el productos por su ID con mongoose'})
    }
}

const newProductController = async (req, res, next) => {
    let newProduct = req.body
    try {
        let {code, title, description, thumbnails, price, stock, category} = newProduct
        if(!code || !title || !description || thumbnails.length <= 0 || !price || !stock || !category) {
            CustomizedError.createError({
                name: 'Error en el producto',
                cause: generateErrorInfo(EError.PRODUCT_INVALID_DATA_ERROR, newProduct),
                message: 'No se cuenta con todos los parámetros requeridos para crear el producto',
                code: EError.PRODUCT_INVALID_DATA_ERROR
            })
        }
        let createdProductResult = await newProductService(newProduct)
        if(createdProductResult) {
            res.status(201).send({status: 'success', payload: createdProductResult._id})
        }else {
            CustomizedError.createError({
                name: 'Error en el producto',
                cause: generateErrorInfo(EError.PRODUCT_INVALID_DATA_ERROR, newProduct),
                message: 'No se cuenta con todos los parámetros requeridos o no son válidos para crear el producto',
                code: EError.PRODUCT_INVALID_DATA_ERROR
            })
        }
    }catch(err) {
        req.logger.error(`No es posible crear el producto\n${err}\n[code:] ${err.code}\n[casue:] ${err.cause}`)
        next(err)
        res.status(404).send({status: 'error', error: 'No es posible crear el producto nuevo con mongoose'})
    }
    
}

const productUpdateController = async (req, res, next) => {
    try {
        let productToUpdate = req.body
        let productUpdatedResult = {}
        let {_id, code, title, description, thumbnails, price, stock, category} = productToUpdate
        if(!_id, !code || !title || !description || thumbnails.length <= 0 || !price || !stock || !category) {
            CustomizedError.createError({
                name: 'Error en el producto',
                cause: generateErrorInfo(EError.PRODUCT_INVALID_DATA_ERROR, productToUpdate),
                message: 'No se cuenta con todos los parámetros requeridos para actualizar el producto',
                code: EError.PRODUCT_INVALID_DATA_ERROR
            })
        }
        let foundProductInDb = await searchProductByIdService(_id)
        if(req.user.roll === 'ADMIN') {
            productUpdatedResult = await productUpdateService(productToUpdate)
        }else if(req.user.roll ==='PREMIUM' && foundProductInDb.owner === req.user.email && productToUpdate.owner === foundProductInDb.owner) {
            productUpdatedResult = await productUpdateService(productToUpdate)
        }
        if(productUpdatedResult){
            res.status(202).send({status:'success', payload: 'El producto fue actualizado con éxito'})
        }else {
            CustomizedError.createError({
                name: 'Error en el producto',
                cause: generateErrorInfo(EError.PRODUCT_INVALID_DATA_ERROR, productToUpdate),
                message: 'No se cuenta con todos los parámetros requeridos o no son válidos para actualizar el producto',
                code: EError.PRODUCT_INVALID_DATA_ERROR
            })
        }  
    }catch(err) {
        req.logger.warning(`No es posible actualizar el producto\n${err}\n[code:] ${err.code}\n[casue:] ${err.cause}`)
        next(err)
        res.status(404).send({status: 'error', error: 'No es posible actualizar el producto con mongoose'})
    }
}

const deleteProductController = async (req, res, next) => {
    try {
        let {pid} = req.params
        let productDeletedResult = {}
        if(!pid) {
            CustomizedError.createError({
                name: 'Error en el producto',
                cause: generateErrorInfo(EError.PRODUCT_INVALID_PID_ERROR, pid),
                message: 'No se cuenta con el parámetro pid para borrar el producto',
                code: EError.PRODUCT_INVALID_PID_ERROR
            })
        }
        let foundProductInDb = await searchProductByIdService(pid)
        if(req.user.roll === 'ADMIN') {
            productDeletedResult = await deleteProductService(pid)
        } else if(req.user.roll ==='PREMIUM' && foundProductInDb.owner === req.user.email) {
            productDeletedResult = await deleteProductService(pid)
        }
        if(productDeletedResult) {
            res.status(202).send({status: 'success', payload: 'El producto fue eliminado con éxito'})
        }else {
            CustomizedError.createError({
                name: 'Error en el producto',
                cause: generateErrorInfo(EError.PRODUCT_INVALID_PID_ERROR, pid),
                message: 'No se cuenta con el parámetro correcto pid para borrar el producto',
                code: EError.PRODUCT_INVALID_PID_ERROR
            })
        }
    }catch(err) {
        req.logger.warning(`No es posible borrar el producto\n${err}\n[code:] ${err.code}\n[casue:] ${err.cause}`)
        next(err)
        res.status(404).send({status: 'error', error: 'No es posible eliminar el producto con mongoose'})
    }
}

export default {
    conditionalSearchProductsController,
    searchProductByIdController,
    newProductController,
    productUpdateController,
    deleteProductController
}