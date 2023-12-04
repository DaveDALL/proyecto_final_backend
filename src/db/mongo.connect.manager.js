import mongoose from 'mongoose'
import CONFIG from '../../config/config.env.js'
import CustomizedError from '../utils/errorHandler/errorHandler.customErrors.js'
import EError from '../utils/errorHandler/errorHandler.enums.js'
import { generateErrorInfo } from '../utils/errorHandler/errorHandler.info.js'
import logger from '../utils/logging/factory.logger.js'
const { MONGO_URL } = CONFIG

export default {
    connect: async () => {
        const config = {
            connectTimeoutMS: 7000,
            socketTimeoutMS: 7000,
            useUnifiedTopology: true
          }
        return await mongoose.connect(MONGO_URL, config).then(connection => {
            if(!connection) {
                CustomizedError.createError({
                    name: 'Error en el usuario',
                    cause: generateErrorInfo(EError.DATABASE_CONECTION_ERROR, null),
                    message: 'No se cuenta con el parámetro para buscar el usuario',
                    code: EError.DATABASE_CONECTION_ERROR
                })
            }
            logger.info('DataBase successful connection')

        }).catch(err => {
            logger.fatal(`Error at Database connection ${err}`)
        })
    }
}