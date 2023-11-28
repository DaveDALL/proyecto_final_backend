
const userPolicies = (rolls) => {

    return (req, res, next) => {
        if(rolls[0] === 'PUBLIC') return next()
        if(!req.user) res.status(403).send(`<h2>Acceso denegado</h2>`)
        next()
    }
}

export default userPolicies

