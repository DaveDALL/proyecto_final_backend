import multer from 'multer'
import __dirname from '../../dirPath.js'
import fs, { existsSync } from 'fs'

const avatarStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        let { uid } = req.params
        let mainDir = `${__dirname}/public/customerInfo/${uid}`
        let existMainDir = fs.existsSync(mainDir)
        if(!existMainDir) {
            fs.mkdirSync(mainDir)
        }
        let secondDir = `${__dirname}/public/customerInfo/${uid}/avatar`
        let existSecondDir = fs.existsSync(secondDir)
        if(!existSecondDir){
            fs.mkdirSync(secondDir)
        }
        return cb(null, secondDir)
    },
    filename: (req, file, cb) => {
        const { uid } = req.params
        let extArray = file.mimetype.split('/')
        let extension = extArray[1]
        let fileName = `${uid}_${file.fieldname}_${Date.now()}.${extension}`
        cb(null, fileName)
    }
})

const productStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        let { uid } = req.params
        let mainDir = `${__dirname}/public/customerInfo/${uid}`
        let existMainDir = fs.existsSync(mainDir)
        if(!existMainDir) {
            fs.mkdirSync(mainDir)
        }
        let secondDir = `${__dirname}/public/customerInfo/${uid}/productImages`
        let existSecondDir = fs.existsSync(secondDir)
        if(!existSecondDir){
            fs.mkdirSync(secondDir)
        }
        return cb(null, secondDir)
    },
    filename: (req, file, cb) => {
        const { uid } = req.params
        let extArray = file.mimetype.split('/')
        let extension = extArray[1]
        let fileName = `${uid}_${file.fieldname}_${Date.now()}.${extension}`
        cb(null, fileName)
    }
})

const documentStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        let { uid } = req.params
        let mainDir = `${__dirname}/public/customerInfo/${uid}`
        let existMainDir = fs.existsSync(mainDir)
        if(!existMainDir) {
            fs.mkdirSync(mainDir)
        }
        let secondDir = `${__dirname}/public/customerInfo/${uid}/documents`
        let existSecondDir = fs.existsSync(secondDir)
        if(!existSecondDir){
            fs.mkdirSync(secondDir)
        }
        return cb(null, secondDir)
    },
    filename: (req, file, cb) => {
        const { uid } = req.params
        let extArray = file.mimetype.split('/')
        let extension = extArray[1]
        let fileName = `${uid}_${file.fieldname}_${Date.now()}.${extension}`
        cb(null, fileName)
    }
})

const avatarUploader = multer({storage: avatarStorage})
const productsUploader = multer({storage: productStorage})
const documentsUploader = multer({storage: documentStorage})

export default {
    avatarUploader,
    productsUploader,
    documentsUploader
}
