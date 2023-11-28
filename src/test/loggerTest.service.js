import logger from '../utils/logging/factory.logger.js'

const loggerTestService = (arg1, arg2, arg3) => {
    logger.info('Entro al enpoint de prueba de winston logger')
    logger.info(`Se reciben los siguientes parametros: ${arg1} ${arg2} ${arg3}`)

    if(!arg1 && !arg2 && !arg3) {
        logger.fatal('No se cuentan con todos los parámetros')
    }else if((!arg1 && !arg2) || (!arg1 && !arg3) || (!arg2 && !arg3)) {
        logger.error('Solo se recibió un parámetro')
    }else if(!arg1 || !arg2 || !arg3) {
        logger.warning('Solo se recibieron 2 parámetros')
    }else if(isNaN(parseInt(arg1)) || isNaN(parseInt(arg2)) || isNaN(parseInt(arg3))) {
        logger.fatal('Los parámetros deben ser números enteros')
    }else {
        logger.debug('Se recibieron los parámetros de forma exitosa')
        let suma = parseInt(arg1) + parseInt(arg2) + parseInt(arg3)
        return suma
    }
}

export default loggerTestService
