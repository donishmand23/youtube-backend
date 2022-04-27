import { NotFoundError, ValidationError, InternalServerError } from '../utils/errors.js'
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

        const video = videos.find(video => video.videoId == req.params.videoId && video.userId == req.userId)

        video.title = title || video.title
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

const DELETE = (req, res, next) => {
    try {

        const users = req.readFile('users')
        const videos = req.readFile('videos')

        const videoIndex = videos.findIndex(video => video.videoId == req.params.videoId && video.userId == req.userId)

        if (videoIndex == -1) {
            return next(new NotFoundError(404, "There is no such video!"))
        }

        const [ video ] = videos.splice(videoIndex, 1)
        req.writeFile('videos', videos)

        video.user = users.find(user => user.userId == req.userId)
        delete video.userId
        delete video.user.password

        return res.status(200).json({
            status: 200,
            message: "The video successfully deleted!",
            data: video
        })

    } catch (error) {
        return next(new InternalServerError(500, error.message))
    }
}

export default {
    GET, POST, PUT, DELETE
}