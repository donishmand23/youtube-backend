import controller from '../controllers/video.js'
import { Router } from "express"

const router = Router()

router.get('/videos', controller.GET)

export default router