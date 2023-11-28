import express from 'express'
import authController from '../controllers/auth.controller.js'
const { Router } = express
const {authRegistrationController, authLoginController} = authController
const authRouter = new Router()

authRouter.post('/authRegistration', authRegistrationController)

authRouter.post('/authLogin', authLoginController)

export default authRouter