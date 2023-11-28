export default class CustomizedError {
    static createError({name="Error", code="999", message="Error Desconocido", cause="Unknowed"}) {
        const error = new Error(message, {cause})
        error.name = name
        error.code = code
        throw error
    }
}