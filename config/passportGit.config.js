import passport from 'passport'
import { Strategy as gitHubStrategy } from 'passport-github2'
import User from '../src/models/users.model.js'
import config from './config.env.js'
import { UserGitDTO } from '../src/dto/userGit.dto.js'
import url from 'url'
const { CLIENT_ID, CLIENT_SECRET, CALLBACK_URL } = config

const initializePassportGit = () => {
    passport.use(
        'gitHubAuth',
        new gitHubStrategy(
            {
                clientID: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
                callbackURL: `${CALLBACK_URL}`
            }, async (accessToken, refreshToken, profile, done) => {
                try {
                    let gitUserDTO = new UserGitDTO(profile._json)
                    let userGit = gitUserDTO.userDTO()
                    if(userGit.userMail) {
                        let foundUser = await User.findOne({userMail: userGit.userMail})
                        if(!foundUser) {
                            let createdUser = await User.create(userGit)
                            return done(null, createdUser)
                        } else return done(null, foundUser)
                    } else throw new Error('El usuario no cuenta con Email público')
                    }catch(err) {
                        return done(null, err)
                    }
            }))}

export default initializePassportGit




 