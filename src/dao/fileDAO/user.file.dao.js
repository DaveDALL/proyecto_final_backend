import fs from 'fs'
import crypto from 'crypto'
import CONFIG from '../../../config/config.env.js'
const { SECRET } = CONFIG

export class UserFileDAO {
    constructor(path) {
        this.path = path
    }
    async createUser (user) {
        const cypher = crypto.Cipher('aes192', SECRET)
        let encrypted = cypher.update(user.password, 'utf-8', 'hex')
        encrypted += cypher.final('hex')
        try {
            let credentials = [{
                username: user.username,
                password: encrypted
            }]
            await fs.promises.writeFile(this.path, JSON.stringify(credentials, null, 2), 'utf-8')
            console.log("Usuario registrado Exitosamente...")
        }catch(err) {
            console.log("Error al crear el usuario...")
        }
    }
    async validateUser (user) {
        try {
            let usersJsonDB = await fs.promises.readFile(this.path, 'utf-8')
            let usersDB = JSON.parse(usersJsonDB)
            let existUser = usersDB.find(userDB => userDB.username === user.username)
            if(existUser) {
                const discipher = crypto.Decipher('aes192', SECRET)
                let decrypted = discipher.update(existUser.password, 'hex', 'utf-8')
                decrypted += discipher.final('utf-8')
                if(decrypted === user.password) {
                    console.log("Usuario validado correctamente...")
                }else {
                    console.log("Contraseña incorrecta...")
                }
            } else {
                console.log("El usuario no existe...") 
        }
        }catch(err) {
            console.log("No es posible leer el archivo de usuarios...")
        }
    }
}
