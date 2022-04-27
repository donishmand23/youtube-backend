import Joi from 'joi'

export const userValidationRegister = Joi.object({
    body: Joi.object({
        username: Joi.string().required().max(15).alphanum(),
        password: Joi.string().required().min(4),
    }),
})

export const userValidationLogin = Joi.object({
    body: Joi.object({
        username: Joi.string().required(),
        password: Joi.string().required(),
    }),
})

export const userValidationToken = Joi.object({
    query: Joi.object({
        token: Joi.string().required()
    }),
})

export const videoValidationPost = Joi.object({
    body: Joi.object({
        title: Joi.string().required().max(30).alphanum()
    }),
})

export const videoValidationPut = Joi.object({
    body: Joi.object({
        title: Joi.string().required().max(30).alphanum()
    }),
    params: Joi.object({
        videoId: Joi.number().required()
    })
})

export const videoValidationDelete = Joi.object({
    params: Joi.object({
        videoId: Joi.number().required()
    })
})
