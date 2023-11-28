import express from 'express'
import passport from 'passport'
const { Router } = express
import Message from '../models/message.model.js'
import userpolicies from '../middlewares/userMiddleware/userRollValid.middleware.js'

function customerChat(io) {
    const router = new Router()
    let allMessages = []
    let createdMessage = {}
    let control = 0
    
    router.get('/', passport.authenticate('jwtAuth', {session:false}), userpolicies(['PREMIUM', 'USUARIO']), async (req, res) => {
        if(control === 0) {
            createdMessage = await Message.create({messages: allMessages})
            control = 1
        }
        io.on('connection', (socket) => {
            console.log('nuevo usuario conectado ' + socket.id)
            socket.on('chatMessage', (data) => {
                if(allMessages.length > 0) {
                    allMessages.push(data)
                }else allMessages = [data]
                io.emit('allMessages', allMessages)
            })
            socket.on('disconnect', async (reason) => {
                console.log('usuario desconectado ' + reason)
                try {
                    if(control === 1) {
                        if(allMessages.length > 0) {
                            await Message.updateOne({_id: createdMessage._id}, {messages: allMessages})
                        }else await Message.deleteOne({_id: createdMessage._id})
                        allMessages = []
                        control = 0
                    }
                    socket.removeAllListeners()
                }catch(err) {
                    console.log('Error al crear el chat en mongoose ' + err)
                }
            })
        })
        
        res.render('chat', {})
    })

    return router
}

export default customerChat