import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import sectionsRoutes from './routes/sections.js'
import bondsRoutes from './routes/bonds.js'
import resultsRoutes from './routes/results.js'
import refundsRoutes from './routes/refunds.js'
import vouchersRoutes from './routes/vouchers.js'
import materialsRoutes from './routes/materials.js'
import { getDb, queryOne } from './db.js'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
app.use('/api/materials', materialsRoutes)

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

if (process.env.NODE_ENV === 'production') {
  const staticPath = path.join(__dirname, '..', '..', 'client');
  app.use(express.static(staticPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(staticPath, 'index.html'));
  });
}

app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
  res.status(500).json({
    success: false,
    error: 'Server internal error',
  })
})

app.use((_req: Request, res: Response) => {
  if (process.env.NODE_ENV === 'production') {
    const staticPath = path.join(__dirname, '..', '..', 'client');
    res.sendFile(path.join(staticPath, 'index.html'));
  } else {
    res.status(404).json({
      success: false,
      error: 'API not found',
    })
  }
})

export default app
