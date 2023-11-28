import fs from 'fs'

export class CartFileDAO {
    constructor(path) {
        this.carts = []
        this.path = path
    }
    async #readingFile () {
        let fileEXistCheck = fs.existsSync(this.path)
        if(fileEXistCheck) {
            try {
                let cars = await fs.promises.readFile(this.path, 'utf-8')
                if(cars.length > 0) {
                    let parsedCarts = JSON.parse(cars)
                    return parsedCarts
                }else return []
            }catch (err) {
                console.log("Error al leer el archivo...")
            }
        }else return []
    }
    async #findItemId(id) {
        this.carts = await this.#readingFile()
        if(this.carts.length > 0) {
            let cartIndex = this.carts.findIndex(cart => cart.id === id)
            return cartIndex
        }else return -1
    }
    #idFiltering(id) {
        return this.carts.filter(cart => cart.id === id)
    }
    #idGenerator () {
        return Math.random().toString(16) + Date.now().toString(36)
    }
    async #cartPush (id, products) {
        this.carts.push({id: id, products})
        try {
            await fs.promises.writeFile(this.path, JSON.stringify(this.carts, null, 2), 'utf-8')
            return true
        }catch (err) {
            console.log("Error al escribir el Archivo...")
            return false
        }
    }
    async createCart () {
        let existingCarts = await this.#readingFile()
        let id = this.#idGenerator()
        if (existingCarts.length > 0) {
            let products = []
            this.carts = [...existingCarts]
            let cartCreatedCorrerct = await this.#cartPush(id, products)
            if(cartCreatedCorrerct){
                return id
            }else {
                return false
            } 
        }else {
            let newCart = [
                {
                    id: id,
                    products: []
                }
            ]
            await fs.promises.writeFile(this.path, JSON.stringify(newCart, null, 2), 'utf-8')
            return id
        }
    }
    async updateCart (cid, pid, item) {
        let cartFound = await this.#findItemId(cid)
        this.carts = await this.#readingFile()
        if(cartFound >= 0) {
            let productFound = this.carts[cartFound].products.find(product => product.id === pid)
            if(productFound) {
                this.carts[cartFound].products = this.carts[cartFound].products.map(product => {
                    if(product.id === pid) {
                        return {...product, quantity: item.quantity}
                    }else return product
                })
            } else {
                this.carts[cartFound].products.push({id: item.id, quantity: item.quantity})
            }
            await fs.promises.writeFile(this.path, JSON.stringify(this.carts, null, 2), 'utf-8')
            return true
        }else {
           console.log("El Cart solicitado para modificar no existe...")
            return false
        }

    }
    async getCartById (id) {
        let itemFound = await this.#findItemId(id)
        if(itemFound >= 0) {
            let idFoundProduct = this.#idFiltering(id)
            return idFoundProduct
        } else {
            console.log("No se encontró el Cart con el ID solicitado...")
            return []
        }
    }
    async deleteCartById (id) {
        let itemFound = await this.#findItemId(id)
        this.carts = await this.#readingFile()
        if(itemFound >= 0) {
            this.carts = this.carts.filter(cart => cart.id !== id)
            await fs.promises.writeFile(this.path, JSON.stringify(this.carts, null, 2), 'utf-8')
            return true
        }else {
            console.log('El Cart con el ID solicitado no existe...')
            return false
        }
    }
}


