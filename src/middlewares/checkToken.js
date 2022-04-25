import { ForbiddenError } from "../utils/errors.js"
import JWT from "../utils/jwt.js"

export default (req, res, next) => {
    try {
        const { token } = req.headers
        
        if (!token) {
            return next(new ForbiddenError(403, "You are not allowed!"))
        }

        const { userId, ip, agent } = JWT.verify(token)

        const reqAgent = req.headers['user-agent']
        const reqIP = req.ip

        if (ip !== reqIP || agent !== reqAgent) {
            return next(new ForbiddenError(403, "You are not allowed!"))
        }

        if (!req.readFile('users').some(user => user.userId == userId)) {
            return next(new ForbiddenError(403, "You are not allowed!"))
        }

        req.userId = userId

        return next()
    } catch (error) {
        return next(new ForbiddenError(403, error.message))
    }
}