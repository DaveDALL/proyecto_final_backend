import DAOS from '../dao/daos.factory.js'
import ticketService from '../services/ticket.service.js'
import logger from '../utils/logging/factory.logger.js'
const { CartDAO, ProductDAO, UserDAO } = DAOS

const getCartByIdService = async (cid) => {
    try {
        let cart = await CartDAO.getCartById(cid)
        if(cart){
            return cart
        }else {
            logger.debug('No encuentra el cart en MongoDB')
            return {}
        }
    }catch(err) {
        throw new Error('Error al obtener el cart con mongoose ', {cause: err})
    }
}

const newCartService = async () => {
    try{
        let cartCreatedResult = await CartDAO.createCart()
        if(cartCreatedResult) {
            return cartCreatedResult
        }else {
            logger.error('Error al crear el cart en MondoDB')
            return {}
        }
    }catch(err) {
        throw new Error('Error al crear el cart en MongoDB ', {cause: err})
    }
}

const updateCartService = async (cid, productId, qty) => {
    try {
        let updatedCartResult = await CartDAO.updateCartById(cid, productId, qty)
        if(updatedCartResult) {
            return updatedCartResult
        }else {
            logger.error('Error al actualizar el cart en MongoDB')
            return {}
        }
    }catch(err) {
        throw new Error('Error al actualizar el cart en Mongo DB ', {cause: err})
    }
}

const delProductFromCartService = async (cid, pid) => {
    try {
        let deletedProductResult = await CartDAO.deleteProductFromCart(cid, pid)
        if(deletedProductResult) {
            return deletedProductResult
        }else {
            logger.error('Error borrar el producto del Cart en MongoDB')
            return {}
        }
    }catch(err) {
        throw new Error('Error borrar el producto del Cart en MongoDB ', {cause: err})
    }
}

const deleteCartService = async (cid) => {
    try {
        let deletedCartResult = await CartDAO.deleteCartById(cid)
        if(deletedCartResult) {
            return deletedCartResult
        }else {
            logger.error('No es posible borrar el cart en MongoDB')
            return {}
        }
    }catch(err) {
        throw new Error('Error al borrar el Cart en MongoDB ', {cause: err})
    }
}

const purchaseCartService = async (cid) => {
    try {
        let userByCart = await UserDAO.getUserByCart(cid)
        let {userMail, cartId} = userByCart
        let products = cartId.products
        let amount = 0
        let ticket = {}
        let productsInStock = []
        let productsOutStock = []
        await products.map(async product => {
            try{
                let {productId, qty} = product
                if(productId.stock >= qty) {
                    product.productId.stock = productId.stock - qty
                    amount += qty * productId.price
                    productsInStock.push({productId: productId._id, qty: qty, subtotal: qty * productId.price})
                    await ProductDAO.updateProduct(product.productId)
                    await CartDAO.deleteProductFromCart(cartId, productId._id)
                } else productsOutStock.push(productId._id)
            }catch(err) {
                throw new Error('Error al actualizar el producto o borrar el cart en MongoDB ', {cause: err})
            }
        })
        let ticketCreated = await ticketService.createTicketService(productsInStock, amount, userMail)
        if(ticketCreated) {
            ticket = await ticketService.getTicketbyId(ticketCreated._id)
        }
        let createdTicketResult = {ticket, productsOutStock}
        if(createdTicketResult) {
            return createdTicketResult
        }else {
            logger.error('Error al crear el ticket en MongoDB')
        }
    }catch(err) {
        throw new Error('Error al crear el ticket en MongoDB ', {cause: err})
    }
}

export default {
    getCartByIdService,
    newCartService,
    updateCartService,
    delProductFromCartService,
    deleteCartService, 
    purchaseCartService
}