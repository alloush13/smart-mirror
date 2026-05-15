import { Router } from 'express'

import { SkinController } from '../controllers/skin.controller'

export function createSkinRouter(
  controller: SkinController,
) {
  const router = Router()

  router.post(
    '/analyze',
    controller.analyze.bind(controller),
  )

  return router
}
