import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import sectionsRoutes from './routes/sections.js'
import bondsRoutes from './routes/bonds.js'
import resultsRoutes from './routes/results.js'
import refundsRoutes from './routes/refunds.js'
import vouchersRoutes from './routes/vouchers.js'
import { getDb, queryOne } from './db.js'

dotenv.config()

const app: express.Application = express()

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

app.use('/api/sections', sectionsRoutes)
app.use('/api/bonds', bondsRoutes)
app.use('/api/results', resultsRoutes)
app.use('/api/refunds', refundsRoutes)
app.use('/api/vouchers', vouchersRoutes)

app.use(
  '/api/health',
  (_req: Request, res: Response, _next: NextFunction): void => {
    res.status(200).json({
      success: true,
      message: 'ok',
    })
  },
)

app.use('/api/stats', async (_req: Request, res: Response) => {
  try {
    await getDb()
    const sections = queryOne('SELECT COUNT(*) as count FROM sections')
    const bonds = queryOne('SELECT COUNT(*) as count FROM bonds')
    const refunds = queryOne('SELECT COUNT(*) as count FROM refund_applications WHERE status = \'pending\'')
    const vouchers = queryOne('SELECT COUNT(*) as count FROM payment_vouchers')
    res.json({
      success: true,
      data: {
        sections: (sections as any)?.count || 0,
        bonds: (bonds as any)?.count || 0,
        pendingRefunds: (refunds as any)?.count || 0,
        vouchers: (vouchers as any)?.count || 0,
      },
    })
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) })
  }
})

app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
  res.status(500).json({
    success: false,
    error: 'Server internal error',
  })
})

app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API not found',
  })
})

export default app
