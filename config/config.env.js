import dotenv from 'dotenv'
import { Command } from 'commander'
import __dirname from '../dirPath.js'
const program = new Command()

//Selección de entorno de ejecución (dev: Development, prod: production)
program
    .option('-m, --mode <mode>', 'environment working mode', 'dev')
program.parse(process.argv)
const options = program.opts()

dotenv.config({
    path: (options.mode === 'prod' || options.m === 'prod') ? `${__dirname}/.env.prod` : `${__dirname}/.env.develop`
})

export default {
    PORT: process.env.PORT || 80,
    MONGO_URL: process.env.MONGO_URL,
    SECRET: process.env.SECRET,
    ADMIN_NAME: process.env.ADMIN_NAME,
    ADMIN_MAIL: process.env.ADMIN_MAIL,
    ADMIN_PASS: process.env.ADMIN_PASS,
    ADMIN_ROLL: process.env.ADMIN_ROLL,
    CLIENT_ID: process.env.CLIENT_ID,
    CLIENT_SECRET: process.env.CLIENT_SECRET,
    CALLBACK_URL: process.env.CALLBACK_URL,
    FILE_PRODUCTS_DB: process.env.FILE_PRODUCTS_DB,
    FILE_CARTS_DB: process.env.FILE_CARTS_DB,
    DATA_SOURCE: process.env.DATA_SOURCE,
    LOGGER_TYPE: process.env.LOGGER_TYPE,
    EMAIL_SERVICE: process.env.EMAIL_SERVICE,
    EMAIL_PORT: process.env.EMAIL_PORT,
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASS: process.env.EMAIL_PASS
}