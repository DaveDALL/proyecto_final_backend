import express from 'express'
import loggerTestController from './loggerTest.controller.js'
const { Router } = express
const loggerTestRouter = new Router()

loggerTestRouter.get('/', loggerTestController)

export default loggerTestRouter