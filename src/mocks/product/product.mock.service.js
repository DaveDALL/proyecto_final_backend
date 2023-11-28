import fakerProductsDAO from '../../utils/mocking/product.mock.utils.js'
const { generateFakerProduct } = fakerProductsDAO

const productGenerateService = (total) => {
    if(total > 100) total = 100
    const products = Array.from({length: total}, () => generateFakerProduct())
    if(products.length > 0) {
        return products
    } else return []
}

export default {
    productGenerateService
}