import winston from 'winston'
import levelOptions from './levelOptions.logger.js'
const { combine, timestamp, printf, colorize, align } = winston.format

winston.loggers.add(
    'debugLogger',
    {
        levels: levelOptions.levels,
        transports: [
            new winston.transports.Console({
                level: 'debug',
                format: combine(
                    colorize({colors: levelOptions.colors}),
                    timestamp({
                        format: 'DD-MM-YYYY hh:mm:ss A'
                    }),
                    align(),
                    printf(inf => `[${inf.timestamp}] ${inf.level}: ${inf.message}`)
                )})]
    })
