import { ValidationError, InternalServerError } from '../utils/errors.js'
import JWT from '../utils/jwt.js'
import path from 'path'

const GET = (req, res, next) => {
    try {
        let {
            userId,
            search,
            page = process.DEFAULTS.pagination.page,
            limit = process.DEFAULTS.pagination.limit
        } = req.query

        if(req.url == '/admin/videos') userId = req.userId

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

const POST = (req, res, next) => {
    try {
        const { file } = req.files

        if (file.size > 1024 * 1024 * 50) {
            return next(new ValidationError(400, "The file size is too large!"))
        }

        if (!['video/mp4', 'video/mpeg', 'video/mov'].includes(file.mimetype)) {
            return next(new ValidationError(400, "Invalid video format!"))
        }

        if (!req.body.title || req.body.title.length > 50) {
            return next(new ValidationError(400, "Invalid title!"))
        }

        const users = req.readFile('users')
        const videos = req.readFile('videos')

        const fileName = Date.now() + file.name.replace(/\s/g, '')
        file.mv(path.join(process.cwd(), 'uplods', fileName))

        req.body.videoId = videos.at(-1)?.videoId + 1 || 1
        req.body.date = new Date()
        req.body.size = file.size
        req.body.mime = file.mimetype
        req.body.link = fileName
        req.body.userId = req.userId

        videos.push(req.body)
        req.writeFile('videos', videos)

        req.body.user = users.find(user => user.userId == req.body.userId)
        delete req.body.userId
        delete req.body.user.password

        return res.status(200).json({
            status: 200,
            message: "The video successfully uploaded!",
            data: req.body
        })

    } catch (error) {
        return next(new InternalServerError(500, error.message))
    }
}

const PUT = (req, res, next) => {
    try {

        const users = req.readFile('users')
        const videos = req.readFile('videos')
        const title = req.body.title.trim()

        const video = videos.find(video => video.videoId == req.params.videoId && video.userId == req.userId)

        if (!video) {
            return next(new NotFoundError(404, "There is no such video!"))
        }

        if (!title || title.length > 50) {
            return next(new ValidationError(400, "Invalid title!"))
        }

        video.title = title || video.title

        videos.push(req.body)
        req.writeFile('videos', videos)

        video.user = users.find(user => user.userId == req.userId)
        delete video.userId
        delete video.user.password

        return res.status(200).json({
            status: 200,
            message: "The video successfully updated!",
            data: video
        })

    } catch (error) {
        return next(new InternalServerError(500, error.message))
    }
}

export default {
    GET, POST, PUT
}