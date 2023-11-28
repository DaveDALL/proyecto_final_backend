import DAOS from '../dao/daos.factory.js'
import logger from '../utils/logging/factory.logger.js'
const { TicketDAO } = DAOS

const createTicketService = async (products, amount, purchaser) => {
    try {
        let ticketCreatedResult = await TicketDAO.createTicket(products, amount, purchaser)
        if(ticketCreatedResult) {
            return ticketCreatedResult
        } else {
            logger.error('No se pudo crear el ticket en MongoDB')
            return {}
        }
    }catch(err) {
        throw new Error('No fue posible crear el ticket con el servicio ', {cause: err})
    }
}

const getTicketbyId = async (tid) => {
    try {
        let ticket = await TicketDAO.getTicketbyId(tid)
        if(ticket) {
            return ticket
        }else {
            logger.debug('No fue posible encontrar el ticket en MongoDB')
            return {}
        }
    }catch(err) {
        throw new Error('No fue posible obtener el ticket con el servicio ', {cause: err})
    }
}

export default {
    createTicketService,
    getTicketbyId
}