import validations from '../middlewares/validation.js'
import controller from '../controllers/user.js'
import { Router } from "express"

const router = Router()

router.get('/users', controller.GET)
router.post('/login', validations, controller.LOGIN)
router.post('/register', validations, controller.REGISTER)
router.get('/checkToken', validations, controller.TOKEN)

export default router