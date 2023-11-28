export class UserDTO {

    constructor (user) {
        this.userDto = {
            userName: user[0].userName,
            lastName: user[0].lastName,
            userMail: user[0].userMail,
            userRoll: user[0].userRoll
        }
    }

    userDTO () {
        return this.userDto
    }

}