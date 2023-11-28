import Ticket from '../../models/ticket.model.js'

export class TicketMongoDAO {
    constructor () {

    }
    #idGenerator () {
        return Math.random().toString(16)
    }

    async createTicket (products, amount, purchaser) {
        try {
            let ticketCreatedResult = await Ticket.create({
                code: this.#idGenerator(),
                buyedProducts: products,
                amount,
                purchaser
            })
            return ticketCreatedResult
        }catch(err) {
            throw new Error('Error en el DAO, no es posible crear el ticket con mongoose ', {cause: err})
        }
    }

    async getTicketbyId (tid) {
        try {
            let ticket = await Ticket.findOne({"_id": tid})
            return ticket
        }catch(err) {
            throw new Error('No es posible obetener el ticket de MongoDB con mongoose ', {cause: err})
        }
    }
}

