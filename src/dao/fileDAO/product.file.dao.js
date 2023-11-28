import fs from 'fs'

export class ProductFileDAO {
    constructor (path) {
        this.products = []
        this.path = path
    }
    async #readingFile () {
        let fileEXistCheck = fs.existsSync(this.path)
        if(fileEXistCheck) {
            try {
                let p = await fs.promises.readFile(this.path, 'utf-8')
                if(p.length > 0) {
                    return JSON.parse(p)
                }else return []
            }catch (err) {
                console.log("Error en la lectora del archivo...")
            }
        }else return []
    }
    async #findItem (code) {
        this.products = await this.#readingFile()
        if(this.products.length > 0) {
            return this.products.find(product => product.code === code)
        }else {
            return false
        }
    }
    async #findItemId(id) {
        this.products = await this.#readingFile()
        if(this.products.length > 0) {
            return this.products.find(product => product.id === id)
        }else return false 
    }
    #idFiltering (id) {
        return this.products.filter(product => product.id === id)
    }
    #idGenerator () {
        return Date.now().toString(36) + Math.random().toString(16)
    }
    async #productPush (id, p) {
        this.products.push({id: id, code: p.code, title: p.title, description: p.description, thumbnails: p.thumbnails, price: p.price, stock: p.stock, status: p.status, category: p.category})
        try {
            await fs.promises.writeFile(this.path, JSON.stringify(this.products, null, 2), 'utf-8')
        }catch (err) {
            console.log("Error al escribir el Archivo...")
        }
    }
    async addProduct (newProduct) {
        if(newProduct.code && newProduct.title && newProduct.description && newProduct.thumbnails && newProduct.price && newProduct.stock && newProduct.status && newProduct.category) {
            let itemFound = await this.#findItem(newProduct.code)
            if(itemFound) {
                console.log("El Producto ya se encuentra Registrado...")
                return false
            } else {
                let id = this.#idGenerator()
                this.#productPush(id, newProduct)
                return id
            }
        } else {
            console.log("debe introducir un producto con todos los campos requeridos: Código, Nombre, Descripción, Enlace a la imagen, Precio, Stock, Estado, y Categoría")
            return false
        }
    }
    async getProducts () {
        this.products = await this.#readingFile ()
        return this.products
    }
    async getProductById(id) {
        let itemFound = await this.#findItemId(id)
        if (itemFound) {
            return itemFound
        } else {
            console.log("No se encontró el Producto...")
            return false
        }
    }
    async deleteProductById (id) {
        let ps = await this.#readingFile()
        if(ps.length > 0) {
            let findProductId = ps.find(p => p.id === id)
            if(findProductId) {
                this.products = ps.filter(p => p.id !== id)
                await fs.promises.writeFile(this.path, JSON.stringify(this.products, null, 2), 'utf-8')
                console.log("El producto se borro Exitosamente...")
                return true
            }else {
                console.log("No existe el ID solicitado para borrar...")
                return false
            }
        }else {
            console.log("El archivo de productos se encuentra vacio....")
            return false
        }
    }
    async updateProduct (producToModify) {
        if(producToModify.id && producToModify.code && producToModify.title && producToModify.description && producToModify.thumbnails && producToModify.price && producToModify.stock && producToModify.status && producToModify.category) {
            let itemFound = await this.getProductById(producToModify.id)
            if(itemFound) {
                let ps = await this.#readingFile()
                this.products = ps.map(p => {
                    if(p.id === producToModify.id) {
                        return {...p, code: producToModify.code, title: producToModify.title, description: producToModify.description, thumbnails: producToModify.thumbnails, price: producToModify.price, stock: producToModify.stock, status: producToModify.status, category: producToModify.category}
                    } else return p
                })
                await fs.promises.writeFile(this.path, JSON.stringify(this.products, null, 2), 'utf-8')
                return true
            }else {
                console.log("No existe el producto con el ID a modificar...")
                return false
            }
        }else {
            console.log("el producto no cuenta con los campos completos...")
            return false
        }
    }
}

