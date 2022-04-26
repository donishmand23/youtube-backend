import fileUpload from "express-fileupload"
import express from "express"
import path from "path"
import cors from "cors"
import fs from "fs"
import '../config.js'

import userRouter from './routes/user.js'
import videoRouter from './routes/video.js'

import modelMiddleware from './middlewares/model.js'

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors({ origin: '*'}))

app.use(modelMiddleware({ databasePath: path.join(process.cwd(), 'src', 'database')}))
app.use(express.static(path.join(process.cwd(), 'uploads')))
app.use(express.json())
app.use(fileUpload())

app.use(userRouter)
app.use(videoRouter)

app.use((error, req, res, next) => {
    if (error.status !== 500) {
        return res.status(error.status).json({
            status: error.status,
            message: error.message,
            data: null,
            token: null
        })
    }

    fs.appendFileSync(
        path.join(process.cwd(), 'src', 'log.txt'),
        `${req.method}___${req.url}___${Date.now()}___${error.name}___${error.message}\n`
    )

    res.status(error.status).json({
        status: error.status,
        message: 'Internal Server Error',
        data: null,
        token: null
    })

    process.exit()
})

app.listen(PORT, () => console.log(`*${PORT}`))