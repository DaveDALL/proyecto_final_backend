import CONFIG from '../../config/config.env.js'
const { DATA_SOURCE } = CONFIG

let ProductDAO
let CartDAO
let UserDAO
let ChatDAO
let TicketDAO

switch(DATA_SOURCE) {
    case "FILE": {
        const { ProductFileDAO } = await import('../dao/fileDAO/product.file.dao.js')
        const { CartFileDAO } = await import('../dao/fileDAO/cart.file.dao.js')
        const { UserFileDAO } = await import('../dao/fileDAO/user.file.dao.js')
        ProductDAO = new ProductFileDAO()
        CartDAO = new CartFileDAO()
        UserDAO = new UserFileDAO()
        break
    }
    case "MONGO": {
        const { ProductMongoDAO } = await import('./mongoDAO/product.mongo.dao.js')
        const { CartMongoDAO } = await import('./mongoDAO/cart.mongo.dao.js')
        const { UserMongoDAO } = await import('./mongoDAO/user.mongo.dao.js')
        const { MessageMongoDAO } = await import('./mongoDAO/chat.mongo.dao.js')
        const { TicketMongoDAO } =await import('./mongoDAO/ticket.mongo.dao.js')
        ProductDAO = new ProductMongoDAO()
        CartDAO = new CartMongoDAO()
        UserDAO = new UserMongoDAO()
        ChatDAO = new MessageMongoDAO()
        TicketDAO = new TicketMongoDAO()
        break
    }
    default: {
        throw new Error('No se encuentra el parámetro del origen de datos')
    }
}

export default {
    ProductDAO,
    CartDAO,
    UserDAO,
    ChatDAO,
    TicketDAO
}