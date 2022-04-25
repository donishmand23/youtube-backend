import dotenv from 'dotenv'
dotenv.config()


process.env.JWT_EXP = 60 * 60 * 60 * 24

process.DEFAULTS = {}
process.DEFAULTS.pagination = {}
process.DEFAULTS.pagination.page = 1
process.DEFAULTS.pagination.limit = 10