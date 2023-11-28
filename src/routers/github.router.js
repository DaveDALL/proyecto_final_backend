import express from 'express'
import passport from 'passport'
import gitController from '../controllers/github.controller.js'
const { Router } = express
const gitRouter = new Router()
const { githubController } = gitController

gitRouter.get('/github', passport.authenticate('gitHubAuth', {scope: ['user:email'], session: false}))

gitRouter.get('/github/callback', passport.authenticate('gitHubAuth', {scope: ['user:email'], session:false, failureRedirect: '/'}), githubController)

export default gitRouter