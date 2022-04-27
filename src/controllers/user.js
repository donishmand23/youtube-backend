import { ValidationError, AuthorizationError, InternalServerError, BadRequestError } from '../utils/errors.js'
import JWT from '../utils/jwt.js'
import sha256 from 'sha256'
import path from 'path'

const GET = (req, res, next) => {
    try {
        const users = req.readFile('users')
        res.json(users.map(user => {
            delete user.password
            return user
        }))
    } catch (error) {
        return next(new InternalServerError(500, error.message))
    }
}

const TOKEN = (req, res, next) => {
    try {
        const { token } = req.query

        const { userId, ip, agent, exp } = JWT.verify(token)

        const reqAgent = req.headers['user-agent']
        const reqIP = req.ip

        if (
            (ip !== reqIP || agent !== reqAgent) ||
            !req.readFile('users').some(user => user.userId == userId)
        ) {
            return res.status(400).json({
                status: 400,
                message: "Invalid token!",
                tokenExpired: true,
                tokenIsValid: false,
                tokenExpirationTimeRemaining: 0
            })
        }

        const tokenExpirationTimeRemaining = exp - (Date.now() / 1000 | 0)

        return res.status(200).json({
            status: 200,
            message: "Valid token!",
            tokenExpired: false,
            tokenIsValid: true,
            tokenExpirationTimeRemaining
        })

    } catch (error) {
        return res.status(400).json({
            status: 400,
            message: error.message,
            tokenExpired: true,
            tokenIsValid: false,
            tokenExpirationTimeRemaining: 0
        })
    }
}


const LOGIN = (req, res, next) => {
    try {
        const { username, password } = req.body

        const users = req.readFile('users')
        const user = users.find(user => user.username == username && user.password == sha256(password))

        if (!user) {
            return next(new AuthorizationError(400, "Wrong username or password!"))
        }

        delete user.password

        return res.status(200).json({
            status: 200,
            message: "The user successfully logged in!",
            token: JWT.sign({ userId: user.userId, agent: req.headers['user-agent'], ip: req.ip }),
            data: user
        })

    } catch (error) {
        return next(new InternalServerError(500, error.message))
    }
}


const REGISTER = (req, res, next) => {
    try {
        const users = req.readFile('users')

        req.body.userId = users.at(-1)?.userId + 1 || 1
        req.body.password = sha256(req.body.password)

        const user = users.find(user => user.username == req.body.username)
        if (user) {
            return next(new AuthorizationError(400, "The user already exists!"))
        }

        const fileName = Date.now() + req.files.file.name.replace(/\s/g, '')
        req.files.file.mv(path.join(process.cwd(), 'uplods', fileName))

        req.body.avatar = fileName

        users.push(req.body)
        req.writeFile('users', users)

        delete req.body.password

        return res.status(200).json({
            status: 200,
            message: "The user successfully registered!",
            token: JWT.sign({ userId: req.body.userId, agent: req.headers['user-agent'], ip: req.ip }),
            data: req.body
        })

    } catch (error) {
        return next(new InternalServerError(500, error.message))
    }
}


export default {
    LOGIN, REGISTER, GET, TOKEN
}