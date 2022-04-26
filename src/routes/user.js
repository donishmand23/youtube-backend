import controller from '../controllers/user.js'
import { Router } from "express"

const router = Router()

router.get('/users', controller.GET)
router.post('/login', controller.LOGIN)
router.post('/register', controller.REGISTER)
router.get('/checkToken', controller.TOKEN)

export default router