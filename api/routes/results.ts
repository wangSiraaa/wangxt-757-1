import { Router, type Request, type Response } from 'express';
import { getDb, queryAll, queryOne, run } from '../db.js';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    await getDb();
    const rows = queryAll(
      `SELECT br.*, s.section_name, s.section_code, s.status as section_status
       FROM bid_results br
       LEFT JOIN sections s ON br.section_id = s.id
       ORDER BY br.id DESC`
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    await getDb();
    const { section_id, winner_name, award_date, contract_signed } = req.body;
    if (!section_id || !winner_name || !award_date) {
      res.status(400).json({ success: false, error: '标段、中标人、中标日期为必填' });
      return;
    }
    const section = queryOne('SELECT * FROM sections WHERE id = ?', [section_id]);
    if (!section) {
      res.status(400).json({ success: false, error: '关联标段不存在' });
      return;
    }
    if ((section as any).status === 'unopened') {
      res.status(400).json({ success: false, error: '未开标标段不能录入中标结果' });
      return;
    }
    const existing = queryOne('SELECT * FROM bid_results WHERE section_id = ?', [section_id]);
    if (existing) {
      res.status(400).json({ success: false, error: '该标段已有中标结果' });
      return;
    }
    run(
      `INSERT INTO bid_results (section_id, winner_name, award_date, contract_signed) VALUES (?, ?, ?, ?)`,
      [section_id, winner_name, award_date, contract_signed ? 1 : 0]
    );
    if ((section as any).status === 'opened') {
      run(`UPDATE sections SET status = 'awarded', updated_at=datetime('now','localtime') WHERE id = ?`, [section_id]);
    }
    const row = queryOne('SELECT * FROM bid_results WHERE rowid = last_insert_rowid()');
    res.json({ success: true, data: row });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    await getDb();
    const { contract_signed } = req.body;
    const existing = queryOne('SELECT * FROM bid_results WHERE id = ?', [req.params.id]);
    if (!existing) {
      res.status(404).json({ success: false, error: '中标结果不存在' });
      return;
    }
    run(`UPDATE bid_results SET contract_signed = ? WHERE id = ?`, [contract_signed ? 1 : 0, req.params.id]);
    if (contract_signed) {
      run(`UPDATE sections SET status = 'contracted', updated_at=datetime('now','localtime') WHERE id = ?`, [(existing as any).section_id]);
    }
    const row = queryOne('SELECT * FROM bid_results WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: row });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

export default router;
