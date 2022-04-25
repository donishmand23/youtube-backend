import { AuthorizationError, InternalServerError } from '../utils/errors.js'
import JWT from '../utils/jwt.js'
import sha256 from 'sha256'

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

        req.body.userId = users.length ? users.at(-1).userId + 1 : 1
        req.body.password = sha256(req.body.password)

        const user = users.find(user => user.username == req.body.username)
        if (user) {
            return next(new AuthorizationError(400, "The user already exists!"))
        }

        delete req.body.repeat_password

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
    LOGIN, REGISTER, GET
}