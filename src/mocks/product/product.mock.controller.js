import fakerProductService from './product.mock.service.js'
const { productGenerateService } = fakerProductService

const productsGenerateController = (req, res) => {
    let { limit } = req.query
    if(!limit || Number(limit) <= 0) limit = 100
    let products = productGenerateService(limit)
    if(products.length > 0) {
        res.status(200).json({status: 'success', payload: products})
    } else res.status(400).json({status: 'error', error: 'No fue posible obtener los productos '})
}

export default {
    productsGenerateController
}