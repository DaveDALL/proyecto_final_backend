import logger from './factory.logger.js'

const loggerMiddleware = (req, res, next) => {
    req.logger = logger
    req.logger.http(`${req.method} en ${req.url}`)
    next()
}

export default loggerMiddleware