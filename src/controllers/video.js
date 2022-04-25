import { AuthorizationError, InternalServerError } from '../utils/errors.js'
import JWT from '../utils/jwt.js'

const GET = (req, res, next) => {
    try {
        const {
            userId,
            search,
            page = process.DEFAULTS.pagination.page,
            limit = process.DEFAULTS.pagination.limit
        } = req.query

        const videos = req.readFile('videos')
        const users = req.readFile('users')

        const data = videos.filter(video => {
            const byUserId = userId ? video.userId == userId : true
            const bySearch = search ? video.title.toLowerCase().includes(search.toLowerCase()) : true

            video.user = users.find(user => user.userId == video.userId)
            delete video.user.password
            delete video.userId

            return byUserId && bySearch
        }).slice(page - 1 * limit, page * limit)

        res.json(data)

    } catch (error) {
        return next(new InternalServerError(500, error.message))
    }
}

export default {
    GET
}