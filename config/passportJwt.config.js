import passport from 'passport'
import { Strategy as JWTStartegy, ExtractJwt as JWTExtract } from 'passport-jwt'
import config from './config.env.js'
const { SECRET } = config

const initializePassportJwt = () => {
    passport.use('jwtAuth', new JWTStartegy({
        jwtFromRequest: JWTExtract.fromExtractors([cookieExtractor]),
        secretOrKey: SECRET
    }, async (jwt_payload, done) => {
        try {
            let checkPayload = jwt_payload
            delete checkPayload.iat
            delete checkPayload.exp
            let validPayload = (Object.keys(checkPayload).length === 0) ? false : true
            if(validPayload) {
                return done(null, jwt_payload)
            } else return done(null, false)
        } catch(err) {
            return done(null, err)
        }
    }))
}

const cookieExtractor = (req) => {
    let token = null
    if(req && req.cookies) {
        token = req.cookies['jwtCookie']
    }
    
    return token
}

export default initializePassportJwt
