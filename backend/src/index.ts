import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'

dotenv.config()

import { prisma } from './db/client'
import { authRouter } from './routes/auth.routes'
import { githubRouter } from './routes/github.routes'
import { dashboardRouter } from './routes/dashboard.routes'
import { packagesRouter } from './routes/packages.routes'
import { alertsRouter } from './routes/alerts.routes'
import { reposRouter } from './routes/repos.routes'
import { integrationsRouter } from './routes/integrations.routes'
import { notificationsRouter } from './routes/notifications.routes'
import { billingRouter } from './routes/billing.routes'
import { publicRouter } from './routes/public.routes'
import { webhooksRouter } from './routes/webhooks.routes'
import { internalRouter } from './routes/internal.routes'
import { analyticsRouter } from './routes/analytics.routes'
import { activityRouter } from './routes/activity.routes'
import { maintainersRouter } from './routes/maintainers.routes'
import { errorMiddleware } from './middleware/error.middleware'
import { startWorkers } from './workers/signalCollect.worker'
import { startCrons } from './cron'

const app = express()

const corsOrigins = new Set(
  [process.env.FRONTEND_URL, 'http://localhost:3000', 'http://localhost:3001'].filter(
    (origin): origin is string => Boolean(origin)
  )
)

app.use(helmet())
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        callback(null, true)
        return
      }
      if (corsOrigins.has(origin)) {
        callback(null, true)
        return
      }
      if (process.env.NODE_ENV !== 'production' && /^http:\/\/localhost:\d+$/.test(origin)) {
        callback(null, true)
        return
      }
      callback(null, false)
    },
    credentials: true,
  })
)
app.use(morgan('dev'))

app.use('/api/webhooks', express.raw({ type: 'application/json' }), webhooksRouter)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api/auth', authRouter)
app.use('/api/github', githubRouter)
app.use('/api/dashboard', dashboardRouter)
app.use('/api/packages', packagesRouter)
app.use('/api/alerts', alertsRouter)
app.use('/api/repos', reposRouter)
app.use('/api/integrations', integrationsRouter)
app.use('/api/notifications', notificationsRouter)
app.use('/api/billing', billingRouter)
app.use('/api/public', publicRouter)
app.use('/api/internal', internalRouter)
app.use('/api/analytics', analyticsRouter)
app.use('/api/activity', activityRouter)
app.use('/api/maintainers', maintainersRouter)

app.get('/health', (_req, res) => res.json({ status: 'ok' }))

app.use(errorMiddleware)

const PORT = process.env.PORT || 4000

async function main() {
  app.listen(PORT, () => {
    console.log(`Beacon API running on port ${PORT}`)
    startWorkers()
    startCrons()
  })
}

main().catch((err) => {
  console.error('Failed to start server:', err)
  process.exit(1)
})
