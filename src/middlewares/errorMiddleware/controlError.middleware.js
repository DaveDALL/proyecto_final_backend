
export default (err, req, res, next) => {
    switch(String(err.code)[0]) {
        case "1":
            res.status(400).send({status: "error", error: err.name})
            break
        case "2":
            res.status(401).send({status: "error", error: err.name})
            break
        default:
            res.status(404).send({status: "error", error: "Error Desconocido"})
            break
    }
}