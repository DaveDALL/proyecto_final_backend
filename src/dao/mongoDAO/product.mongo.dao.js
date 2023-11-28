import Product from '../../models/products.model.js'

export class ProductMongoDAO {

    constructor() {

    }

    async getProductsByFilter (conditions) {
        let {limit, pageNum, sort, filterBy, keyword} = conditions
        let query = {}
        let searchAggregate = []
        let requiredProducts = {}
        let sorting = ((sort === 'asc') ? 1 : ((sort === 'desc' ? -1 : undefined)))
        let existence = ((filterBy === 'status') ? (keyword === 'true' ? true : false) : undefined)

        try{
            if(sort) {
                if(filterBy) {
                    query[filterBy] = ((filterBy === 'status') ? existence : keyword)
                    searchAggregate = await Product.aggregate([
                        {
                            $match: query
                        },
                        {
                            $sort: {price: sorting}
                        }
                    ])
                }else {
                    searchAggregate = await Product.find().sort({price: sorting})
                }
            }else {
                if(filterBy) {
                    query[filterBy] = ((filterBy === 'status') ? existence : keyword)
                    console.log(query)
                    searchAggregate = await Product.aggregate([
                        {
                            $match: query
                        }
                    ])
                }else {
                    searchAggregate = await Product.find()
                }
            }

            if(limit && pageNum) {
                const options = {
                    limit: Number(limit),
                    page: Number(pageNum)
                }

                requiredProducts = await Product.aggregatePaginate(searchAggregate, options).then(results => {
                    return results
                }).catch(err => {
                    throw new Error('No es posible realizar paginate ', {cause: err})
                })
            }else {
                requiredProducts = {
                    docs: searchAggregate,
                    page: 1,
                    totalPages: 1,
                    hasPrevPage: false,
                    hasNextPage: false,
                    prevPage: null,
                    nextPage: null,
                }
            }

            return requiredProducts
        
        }catch(err) {
            throw new Error('No es posible realizar el filtrado de productos con aggregate y paginate ', {cause: err})
        }
    }

    async getProductById (pid) {
        try {
            let foundProduct = await Product.findOne({_id: pid})
            if(foundProduct) {
                return foundProduct
            } else return {}
        }catch(err) {
            throw new Error('No es posible obtener el producto por ID con mongoose ', {cause: err})
        }
    }

    async createProduct (newProduct) {
        try{
            let {code, title, description, thumbnails, price, stock, status, category, owner} = newProduct
                let productCreatedResult = await Product.create({
                    code,
                    title,
                    description,
                    thumbnails,
                    price,
                    stock,
                    status,
                    category,
                    owner: owner || 'admin'
                })
                return productCreatedResult
        }catch(err) {
            throw new Error('No es posible crear el producto en MongoDB con mongoose ', {cause: err})
        }
    }

    async updateProduct (productToUpdate) {
        try {
            let {_id} = productToUpdate
            let productUpdatedResult = await Product.updateOne({_id: _id}, productToUpdate)
            return productUpdatedResult
        }catch(err) {
            throw new Error('No es posible actualizar el producto en MongoDB con mongoose ', {cause: err})
        }
    }

    async deleteProductById (pid) {
        try {
            let productDeletedResult = await Product.deleteOne({_id: pid})
            return productDeletedResult
        }catch(err) { 
            throw new Error('No es posible eliminar el producto de MongoDB con mongoose ', {cause: err})
        }
    }
}