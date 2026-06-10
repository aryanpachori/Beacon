import { Router } from 'express'
import { prisma } from '../db/client'
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware'

export const notificationsRouter = Router()

notificationsRouter.use(authMiddleware)

notificationsRouter.get('/', async (req: AuthRequest, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        packageId: true,
        packageName: true,
        message: true,
        tier: true,
        read: true,
        readAt: true,
        actionUrl: true,
        createdAt: true,
      },
    })

    const unreadCount = await prisma.notification.count({
      where: { userId: req.user!.userId, read: false },
    })

    res.json({ notifications, unreadCount })
  } catch (err) {
    next(err)
  }
})

notificationsRouter.patch('/:id/read', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params
    const notificationId = Array.isArray(id) ? id[0]! : id
    await prisma.notification.updateMany({
      where: { id: notificationId, userId: req.user!.userId },
      data: { read: true, readAt: new Date() },
    })
    res.json({ success: true })
  } catch (err) {
    next(err)
  }
})

notificationsRouter.patch('/read-all', async (req: AuthRequest, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user!.userId, read: false },
      data: { read: true, readAt: new Date() },
    })
    res.json({ success: true })
  } catch (err) {
    next(err)
  }
})
