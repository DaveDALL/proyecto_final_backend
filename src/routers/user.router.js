import express from 'express'
import passport from 'passport'
import uploader from '../utils/uploader.js'
import userController from '../controllers/user.controller.js'
import userpolicies from '../middlewares/userMiddleware/userRollValid.middleware.js'
const { Router } = express
const { getUserByEmailController, updateUserRollController, userMailPassRecoveryController, userPassLinkRecoveryController, userPassChangeController, uploadDocsController, getAllUsersController, delNotActivityUserController, delUserByEmailController } = userController
const { documentsUploader } = uploader
const userRouter = Router()

let documentsUpload = documentsUploader.fields([{name: 'idDocument', maxCount: 1}, {name: 'addressProof', maxCount: 1}, {name: 'accountStatement', maxCount: 1}])

userRouter.get('/allUserrs', passport.authenticate('jwtAuth', {session:false}), getAllUsersController)

userRouter.delete('/notActivityUsers', passport.authenticate('jwtAuth', {session:false}), delNotActivityUserController)

userRouter.post('/currentUser', passport.authenticate('jwtAuth', {session:false}), getUserByEmailController)

userRouter.post('/premium/:uid', passport.authenticate('jwtAuth', {session:false}), userpolicies(['ADMIN']), updateUserRollController)

userRouter.post('/recoveryPass', userMailPassRecoveryController)

userRouter.get('/recoveryPassLink/:link', userPassLinkRecoveryController)

userRouter.post('/passChanger', userPassChangeController)

userRouter.post('/:uid/documents', passport.authenticate('jwtAuth', {session:false}), documentsUpload, uploadDocsController)

userRouter.delete('/deleteUser', passport.authenticate('jwtAuth', {session:false}), userpolicies(['ADMIN']), delUserByEmailController)

export default userRouter