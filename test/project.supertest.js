import mongoose from 'mongoose'
import { expect } from 'chai'
import supertest from 'supertest'
import CONFIG from '../config/config.env.js'
const { PORT, MONGO_URL } = CONFIG
const requester = supertest(`http://localhost:${PORT}`)

describe('Test de Autenticación', () => {
    let cookie
    beforeEach(async () => {
        await mongoose.connect(MONGO_URL)
    })

    afterEach(async () => {
        mongoose.connection.close()
        setTimeout(() => {
            
        }, 1000);
    })


    it('[POST] - /userRegistration - Test de registro de usuario exitoso', async () => {
        const mockUser1 = {
            userName: 'jorge',
            lastName: 'cuacuas',
            userMail:'jcuacuas@mail.com',
            userPassword: 'abcdef'
        }
        try{
            const response = await requester.post('/authRegistration').send(mockUser1)
            //Posterior al registro de usuario debe recibir los datos del usuario y redirigir hacia /
            expect(response._data).to.be.ok
            expect(response.statusCode).to.be.eql(302)
            expect(response.headers.location).to.be.eql('/')
        }catch(err) {
            console.log('Error la realizar el test de registro de usuario' + err)
        }
    })

    it('[POST] - /authLogin - Test de login de usuario', async () => {
        let mockUserCredential = {
            userMail: 'jcuacuas@mail.com',
            userPassword: 'abcdef'
        }
        try{
            const response = await requester.post('/authLogin').send(mockUserCredential)
            const cookieResult = response.header['set-cookie'][0]
            expect(cookieResult).to.be.ok
            cookie = {
                name: cookieResult.split('=')[0],
                value: cookieResult.split('=')[1]
            }
            //Se verifica que exista la cookie de autenticación y que rediriga a la página de productos
            expect(cookie.name).to.be.ok.and.eql('jwtCookie')
            expect(cookie.value).to.be.ok
            expect(response.statusCode).to.be.eql(302)
            expect(response.headers.location).to.be.eql('/products')
        }catch(err) {
            console.log('Error en el test de autenticación de usuario ' + err)
        }
    })

})

describe('Test de Productos', () => {
    beforeEach(async () => {
        await mongoose.connect(MONGO_URL)
    })

    afterEach(async () => {
        mongoose.connection.close()
        setTimeout(() => {
            
        }, 1000);
    })

    it('[GET] - /api/products/ - Test request de productos con query params', async () => {
        
    })

})


