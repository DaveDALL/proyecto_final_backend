import express from 'express'
import passport from 'passport'
import productController from '../controllers/products.controller.js'
import userpolicies from '../middlewares/userMiddleware/userRollValid.middleware.js'
const { Router } = express
const router = new Router()
const {conditionalSearchProductsController, searchProductByIdController, newProductController, productUpdateController, deleteProductController} = productController

router.get('/', passport.authenticate('jwtAuth', {session:false}), conditionalSearchProductsController)

router.get('/:pid', passport.authenticate('jwtAuth', {session:false}), searchProductByIdController)

router.post('/newProduct', passport.authenticate('jwtAuth', {session:false}), userpolicies(['PREMIUM', 'ADMIN']), newProductController)

router.put('/updateProduct', passport.authenticate('jwtAuth', {session:false}), userpolicies(['PREMIUM', 'ADMIN']), productUpdateController)

router.delete('deleteProduct/:pid', passport.authenticate('jwtAuth', {session:false}), userpolicies(['PREMIUM', 'ADMIN']), deleteProductController)

export default router
