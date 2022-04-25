import controller from '../controllers/user.js'
import { Router } from "express"

const router = Router()

router.get('/users', controller.GET)

export default router