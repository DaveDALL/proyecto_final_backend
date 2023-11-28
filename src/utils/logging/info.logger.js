import winston from 'winston'
import levelOptions from './levelOptions.logger.js'
const { combine, timestamp, printf, colorize, align } = winston.format


winston.loggers.add(
    'infoLogger',
    {
        levels: levelOptions.levels,
    transports: [
        new winston.transports.Console({
            level: 'info',
            format: combine(
                colorize({colors: levelOptions.colors}),
                timestamp({
                    format: 'DD-MM-YYYY hh:mm:ss A'
                }),
                align(),
                printf(inf => `[${inf.timestamp}] ${inf.level}: ${inf.message}`)
            )
        }),
        new winston.transports.File({
            level: 'error',
            filename: './errors.log',
            format: combine(
                colorize({colors: levelOptions.colors}),
                timestamp({
                    format: 'DD-MM-YYYY hh:mm:ss A'
                }),
                align(),
                printf(inf => `[${inf.timestamp}] ${inf.level}: ${inf.message}`)
            )
        })
    ]})
