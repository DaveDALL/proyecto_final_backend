import nodemailer from 'nodemailer'
import CONFIG from '../config/config.env.js'
const { EMAIL_SERVICE, EMAIL_PORT, EMAIL_USER, EMAIL_PASS } = CONFIG

const emailTransport = nodemailer.createTransport({
    service: EMAIL_SERVICE,
    port: EMAIL_PORT,
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS
    }
})

export default emailTransport