import express from 'express'
import fakerProductController from './product.mock.controller.js'
const { productsGenerateController } = fakerProductController
const { Router } = express
const mockRouter = Router()

mockRouter.get('/', productsGenerateController)

export default mockRouter