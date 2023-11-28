export class UserGitDTO {

    constructor (user) {
        let fullName = user.name.split(' ')
        this.userGitDto = {
            userName: fullName[0],
            lastName: fullName[1] || ' ',
            userMail: user.userMail || undefined,
            userPassword: '',
            userCart: [],
            userRoll: 'usuario'
        }
    }

    userDTO () {
        return this.userGitDto
    }

}