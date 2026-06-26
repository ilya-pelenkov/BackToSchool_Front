import log from 'electron-log/main'

log.initialize()
log.transports.file.maxSize = 10 * 1024 * 1024 // потом файл ротируется
log.transports.file.format = '[{y}-{m}-{d} {h}:{i}:{s}] [{level}] {text}'
log.transports.file.level = 'info'
log.transports.console.level = 'debug'
log.info('logger ready')
log.info('Log file:', log.transports.file.getFile().path)

export default log
