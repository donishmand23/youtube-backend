import checkToken from '../middlewares/checkToken.js'
import validation from '../middlewares/validation.js'
import controller from '../controllers/video.js'
import { Router } from "express"

const router = Router()

router.get('/videos', controller.GET)
router.get('/admin/videos', checkToken, controller.GET)
router.post('/admin/videos', checkToken, validation, controller.POST)
router.put('/admin/videos/:videoId', checkToken, validation, controller.PUT)
router.delete('/admin/videos/:videoId', checkToken, validation, controller.DELETE)

export default router