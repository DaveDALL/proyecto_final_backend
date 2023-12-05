import express from 'express'
import passport from 'passport'
import viewsController from '../controllers/views.controller.js'
import userpolicies from '../middlewares/userMiddleware/userRollValid.middleware.js'
const { Router } = express
const viewsRouter = new Router()
const {userRegistrationViewController, userLoginController, userLogoutController, productViewController, cartViewController, userPassRecoveryViewController, uploaderController, usersAdminController} = viewsController

viewsRouter.get('/userRegistration', userRegistrationViewController)

viewsRouter.get('/', userLoginController)

viewsRouter.get('/logout', userLogoutController)

viewsRouter.get('/products', passport.authenticate('jwtAuth', {session:false}), productViewController) 

viewsRouter.get('/carts/:cid', passport.authenticate('jwtAuth', {session:false}), userpolicies(['PREMIUM','USUARIO']), cartViewController)

viewsRouter.get('/userPassRecovery', userPassRecoveryViewController)

viewsRouter.get('/uploads', passport.authenticate('jwtAuth', {session:false}), userpolicies(['PREMIUM','USUARIO']), uploaderController)

viewsRouter.get('/usersAdmin', passport.authenticate('jwtAuth', {session:false}), userpolicies(['ADMIN']), usersAdminController)

export default viewsRouter