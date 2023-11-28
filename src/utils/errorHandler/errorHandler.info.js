import EError from './errorHandler.enums.js'

export const generateErrorInfo = (code, data) => {
    switch(code) {
        case EError.USER_REGISTRATION_DATA_ERROR:
            let passLength = data.userPassword.length
            return `Una o mas propiedades estan incompletas o no son válidas.
            Lista de las propiedades requeridas:
            * Se recibe ${data.userName} (Debe ser String)
            * se recibe ${data.lastName} (debe ser String)
            * Se recibe ${data.userMail} (debe ser String)
            * se reciben ${passLength} caracteres (debe ser String alfanumérico)`
            break
        case EError.USER_INVALID_DATA_ERROR:
            return `El correo electrónico o la contraseña no son válidos`
            break
        case EError.CART_INVALID_CID_ERROR:
            return `Se recibe ${data} como cid (Debe se String y un ObjectId de MongoDB)`
            break
        case EError.CART_INVALID_DATA_ERROR:
            if(!data.qty) {
                return `Una o mas propiedades están incompletas o no son válidas.
                Lista de las propiedades requeridas:
                * Se recibe ${data.cid} como cid (Debe se String y un ObjectId de MongoDB)
                * Se recibe ${data.pid} como pid (Debe se String y un ObjectId de MongoDB)`
            }else {
                return `Una o mas propiedades están incompletas o no son válidas.
                Lista de las propiedades requeridas:
                * Se recibe ${data.cid} como cid (Debe se String y un ObjectId de MongoDB)
                * Se recibe ${data.productId} como pid (Debe se String y un ObjectId de MongoDB)
                * Se recibe ${data.qty} como catidad (Debe ser numérico y mayor a cero)`
            }
            break
        case EError.USER_GITHUB_DATA_ERROR:
            return `Una o mas propiedades están incompletas o no son válidas.
            Lista de las propiedades mayormente requeridas:
            * Ser recibe ${data.userMail} (Verificar si el correo esta como público en github)`
            break
        case EError.PRODUCT_INVALID_PID_ERROR:
            return `Se recibe ${data} como pid (Debe ser String y un ObjectId de MongoDB)`    
            break
        case EError.PRODUCT_INVALID_DATA_ERROR:
            if(!data._id){
                return `Una o mas propiedades estan incompletas o no son válidas.
                Lista de las propiedades requeridas:
                * Se recibe ${data.code} (Debe ser String con datos numéricos)
                * Se recibe ${data.title} (Debe ser String con el titulo del producto)
                * Se recibe ${data.description} (Debe ser String con la descriptción del producto)
                * Se recibe ${data.thumbnails} (Debe ser Array con el o los link de imagen de producto)
                * Se recibe ${data.price} (Debe ser Number float de 2 digitos con el precio del producto)
                * Se recibe ${data.stock} (Debe ser Number Integer con el stock del producto)
                * Se recibe ${data.category} (Debe ser String con la categoria del producto)
                Nota: El status del producto es un booleano, true es que esta habilitado, y false que esta dehabilitado`
            }else {
                return `Una o mas propiedades estan incompletas o no son válidas.
                Lista de las propiedades requeridas:
                * Se recibe ${data._id} (Debe ser un ObjectId de MongoDB)
                * Se recibe ${data.code} (Debe ser String con datos numéricos)
                * Se recibe ${data.title} (Debe ser String con el titulo del producto)
                * Se recibe ${data.description} (Debe ser String con la descriptción del producto)
                * Se recibe ${data.thumbnails} (Debe ser Array con el o los link de imagen de producto)
                * Se recibe ${data.price} (Debe ser Number float de 2 digitos con el precio del producto)
                * Se recibe ${data.stock} (Debe ser Number Integer con el stock del producto)
                * Se recibe ${data.category} (Debe ser String con la categoria del producto)
                Nota: El status del producto es un booleano, true es que esta habilitado, y false que esta dehabilitado`
            }
            break
        case EError.USER_MAIL_ERROR:
            return `Se recibe ${data} como correo (Debe ser String)`
            break
        case EError.DATABASE_CONECTION_ERROR:
            return `Problemas en la conexión con la base de datos
            * Se recibe ${data} como respuesta al intentar conectarse a MongoDB`
            break
        default:
            return `Se presento un error desconocido, contacte al desarrollador`
    }
}
