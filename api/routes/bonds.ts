import { Router, type Request, type Response } from 'express';
import { getDb, queryAll, queryOne, run } from '../db.js';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    await getDb();
    const rows = queryAll(
      `SELECT b.*, s.section_name, s.section_code, s.status as section_status
       FROM bonds b
       LEFT JOIN sections s ON b.section_id = s.id
       ORDER BY b.id DESC`
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    await getDb();
    const row = queryOne(
      `SELECT b.*, s.section_name, s.section_code
       FROM bonds b
       LEFT JOIN sections s ON b.section_id = s.id
       WHERE b.id = ?`,
      [req.params.id]
    );
    if (!row) {
      res.status(404).json({ success: false, error: '保证金流水不存在' });
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
    const { section_id, payer_name, amount, bond_date } = req.body;
    if (!section_id || !payer_name || !amount || !bond_date) {
      res.status(400).json({ success: false, error: '标段、缴纳方、金额、缴纳日期为必填' });
      return;
    }
    const section = queryOne('SELECT * FROM sections WHERE id = ?', [section_id]);
    if (!section) {
      res.status(400).json({ success: false, error: '关联标段不存在' });
      return;
    }
    run(
      `INSERT INTO bonds (section_id, payer_name, amount, bond_date, status) VALUES (?, ?, ?, ?, 'paid')`,
      [section_id, payer_name, amount, bond_date]
    );
    const row = queryOne('SELECT * FROM bonds WHERE rowid = last_insert_rowid()');
    res.json({ success: true, data: row });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

export default router;
