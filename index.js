import express from 'express'
import http from 'http'
import session from 'express-session'
import MongoStore from 'connect-mongo'
import cookieParser from 'cookie-parser'
import handlebars from 'express-handlebars'
import passport from 'passport'
import { Server } from 'socket.io'
import swaggerJsDocs from 'swagger-jsdoc'
import swaggerUiExpress from 'swagger-ui-express'
import initializePassportGit from './config/passportGit.config.js'
import initializePassportJwt from './config/passportJwt.config.js'
import mongoManager from './src/db/mongo.connect.manager.js'
import CONFIG from './config/config.env.js'
import logger from './src/utils/logging/factory.logger.js'
import productRouter from './src/routers/products.router.js'
import cartRouter from './src/routers/carts.router.js'
import viewsRouter from './src/routers/views.router.js'
import authRouter from './src/routers/auth.router.js'
import githubRouter from './src/routers/github.router.js'
import userRouter from './src/routers/user.router.js'
import chatRouter from './src/routers/chat.router.js'
import mockRouter from './src/mocks/product/product.mock.router.js'
import loggerTestRouter from './src/test/loggerTest.router.js'
import errorMiddleware from './src/middlewares/errorMiddleware/controlError.middleware.js'
import loggerMiddleware from './src/utils/logging/logger.js'
import __dirname from './dirPath.js'

const app = express()
const server = http.createServer(app)
const io = new Server(server)
const { PORT,  MONGO_URL, SECRET } = CONFIG

//Swagger options
const swaggerOptions = {
    definition: {
        openapi: '3.1.0',
        info:{
            title: 'Rest API de e-commerce de SuperArticulos',
            version: '1.0.0',
            description: 'Rest API con los endpoints para la administración y operación de un e-commerce llamado SuperArticulos',
            contact:{
                name: 'Soporte Técnico de SuperArticulos',
                email: 'super.articulos.corp@gmail.com'
            }
        }
    },
    apis: [`${__dirname}/docs/**/*.yaml`]
}

//Swagger Middleware
const specs = swaggerJsDocs(swaggerOptions)
app.use('/APIDocumentation', swaggerUiExpress.serve, swaggerUiExpress.setup(specs))

//middleware de archivos estaticos publicos, JSON y encoding
app.use(express.static(__dirname + '/public'))
app.use(express.json())
app.use(express.urlencoded({extended: true}))

//Configuracion de Handlebars
app.engine('handlebars', handlebars.engine())
app.set('view engine', 'handlebars')
app.set('views', `${__dirname}/views`)

//Configuración de express session y almacenamiento en MongoDB
app.use(cookieParser())
app.use(session({
    store: MongoStore.create({
        mongoUrl: MONGO_URL,
    }),
    secret: SECRET,
    resave: true,
    saveUninitialized: true
}))

//inicializar passport
app.use(passport.initialize())
initializePassportGit()
initializePassportJwt()

//Logger Middleware
app.use(loggerMiddleware)

//Auth Routers
app.use('/', authRouter)
app.use ('/auth', githubRouter)

//middleware de router
app.use('/api/products', productRouter)
app.use('/api/carts', cartRouter)
app.use('/', viewsRouter)
app.use('/api/users', userRouter)
app.use('/chat', chatRouter(io))
app.use('/mockingproducts', mockRouter)
app.use('/api/loggerTest', loggerTestRouter)

//Error Middleware
app.use(errorMiddleware)

server.listen(PORT, () => {
    logger.info(`Server Runnig at port ${PORT}`)
    mongoManager.connect()
})
