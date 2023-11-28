import CONFIG from '../../../config/config.env.js'
import './debug.logger.js'
import './info.logger.js'
import winston from 'winston'
const { LOGGER_TYPE } = CONFIG
let logger

switch(LOGGER_TYPE) {
    case "DEBUG":
        logger = winston.loggers.get('debugLogger')
    break

    case "INFO":
        logger = winston.loggers.get('infoLogger')
}

export default logger