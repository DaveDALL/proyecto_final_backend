import loggerTestService from "./loggerTest.service.js";

const loggerTestController = async (req, res) => {

    let {num1, num2, num3} = req.query
    let suma = loggerTestService(num1, num2, num3)
    if(isNaN(suma)) {
        req.logger.http(`se obtuvo: ${suma}, verifique sus parámetros ya que deben ser numeros enteros`)
        res.status(401).send({status: 'error', error: 'No se puedo obtener la suma verifique sus parámetros'})
    } else {
        req.logger.http(`El resultado de la suma de enteros es: ${suma}`)
        res.status(200).send({status:'success', payload: suma})
    }
}

export default loggerTestController