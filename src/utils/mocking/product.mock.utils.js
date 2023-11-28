import { faker } from '@faker-js/faker'

const generateFakerProduct = () => {
    return {
        _id: faker.database.mongodbObjectId(),
        code: faker.string.numeric({length: 4, allowLeadingZeros: false}),
        category: faker.commerce.product(),
        title: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        thumbnails:[faker.image.urlLoremFlickr({ category: 'electronics' })],
        Price: faker.commerce.price({min: 400, max: 3000, dec: 2}),
        stock: faker.number.int({min:2, max: 20}),
        status: faker.datatype.boolean({ probability: 0.5 })
    }
}
export default {
    generateFakerProduct
}