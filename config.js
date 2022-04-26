import dotenv from 'dotenv'
dotenv.config()

process.env.JWT_EXP = 1000 * 60 * 60 * 1

process.DEFAULTS = {}
process.DEFAULTS.pagination = {}
process.DEFAULTS.pagination.page = 1
process.DEFAULTS.pagination.limit = 10