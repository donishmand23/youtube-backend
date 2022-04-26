import checkToken from '../middlewares/checkToken.js'
import controller from '../controllers/video.js'
import { Router } from "express"

const router = Router()

router.get('/videos', controller.GET)
router.get('/admin/videos', checkToken, controller.GET)
router.post('/admin/videos', checkToken, controller.POST)
router.put('/admin/videos/:videoId', checkToken, controller.PUT)

export default router