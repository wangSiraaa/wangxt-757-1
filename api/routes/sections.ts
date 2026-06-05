import { Router, type Request, type Response } from 'express';
import { getDb, queryAll, queryOne, run } from '../db.js';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    await getDb();
    const rows = queryAll(
      `SELECT s.*, 
        (SELECT COUNT(*) FROM bonds b WHERE b.section_id = s.id) as bond_count,
        (SELECT COUNT(*) FROM refund_applications r WHERE r.section_id = s.id) as refund_count
       FROM sections s ORDER BY s.id DESC`
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    await getDb();
    const row = queryOne('SELECT * FROM sections WHERE id = ?', [req.params.id]);
    if (!row) {
      res.status(404).json({ success: false, error: '标段不存在' });
      return;
    }
    res.json({ success: true, data: row });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    await getDb();
    const { project_name, section_code, section_name, open_date, status } = req.body;
    if (!project_name || !section_code || !section_name) {
      res.status(400).json({ success: false, error: '项目名称、标段编号、标段名称为必填' });
      return;
    }
    run(
      `INSERT INTO sections (project_name, section_code, section_name, open_date, status) VALUES (?, ?, ?, ?, ?)`,
      [project_name, section_code, section_name, open_date || null, status || 'unopened']
    );
    const row = queryOne('SELECT * FROM sections WHERE section_code = ?', [section_code]);
    res.json({ success: true, data: row });
  } catch (err: any) {
    if (String(err).includes('UNIQUE constraint failed')) {
      res.status(400).json({ success: false, error: '标段编号已存在' });
      return;
    }
    res.status(500).json({ success: false, error: String(err) });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    await getDb();
    const { project_name, section_code, section_name, open_date, status } = req.body;
    const existing = queryOne('SELECT * FROM sections WHERE id = ?', [req.params.id]);
    if (!existing) {
      res.status(404).json({ success: false, error: '标段不存在' });
      return;
    }
    run(
      `UPDATE sections SET project_name=?, section_code=?, section_name=?, open_date=?, status=?, updated_at=datetime('now','localtime') WHERE id=?`,
      [
        project_name ?? (existing as any).project_name,
        section_code ?? (existing as any).section_code,
        section_name ?? (existing as any).section_name,
        open_date ?? (existing as any).open_date,
        status ?? (existing as any).status,
        req.params.id,
      ]
    );
    const row = queryOne('SELECT * FROM sections WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: row });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

export default router;
