import { Router, type Request, type Response } from 'express';
import { getDb, queryAll, queryOne, run } from '../db.js';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    await getDb();
    const rows = queryAll(
      `SELECT r.*, s.section_name, s.section_code, b.payer_name as bond_payer
       FROM refund_applications r
       LEFT JOIN sections s ON r.section_id = s.id
       LEFT JOIN bonds b ON r.bond_id = b.id
       ORDER BY r.id DESC`
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    await getDb();
    const { bond_id, reason } = req.body;
    if (!bond_id || !reason) {
      res.status(400).json({ success: false, error: '保证金流水和退还原因为必填' });
      return;
    }

    const bond = queryOne('SELECT * FROM bonds WHERE id = ?', [bond_id]);
    if (!bond) {
      res.status(400).json({ success: false, error: '保证金流水不存在' });
      return;
    }
    if ((bond as any).status === 'refunded') {
      res.status(400).json({ success: false, error: '该保证金已全部退还，不能重复申请' });
      return;
    }

    const section = queryOne('SELECT * FROM sections WHERE id = ?', [(bond as any).section_id]);
    if (!section) {
      res.status(400).json({ success: false, error: '关联标段不存在' });
      return;
    }

    if ((section as any).status === 'unopened') {
      res.status(400).json({ success: false, error: '未开标项目不能退还' });
      return;
    }

    const bidResult = queryOne('SELECT * FROM bid_results WHERE section_id = ?', [(bond as any).section_id]);
    if (bidResult) {
      const isWinner = (bidResult as any).winner_name === (bond as any).payer_name;
      if (isWinner && !(bidResult as any).contract_signed) {
        res.status(400).json({ success: false, error: '中标人未签合同不能退保证金' });
        return;
      }
    }

    run(
      `INSERT INTO refund_applications (bond_id, section_id, applicant_name, amount, reason, status) VALUES (?, ?, ?, ?, ?, 'pending')`,
      [(bond as any).id, (bond as any).section_id, (bond as any).payer_name, (bond as any).amount, reason]
    );
    const row = queryOne('SELECT * FROM refund_applications WHERE rowid = last_insert_rowid()');
    res.json({ success: true, data: row });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

router.put('/:id/approve', async (req: Request, res: Response) => {
  try {
    await getDb();
    const existing = queryOne('SELECT * FROM refund_applications WHERE id = ?', [req.params.id]);
    if (!existing) {
      res.status(404).json({ success: false, error: '退还申请不存在' });
      return;
    }
    if ((existing as any).status !== 'pending') {
      res.status(400).json({ success: false, error: '只能审批待审批状态的申请' });
      return;
    }
    run(
      `UPDATE refund_applications SET status = 'approved', updated_at=datetime('now','localtime') WHERE id = ?`,
      [req.params.id]
    );
    const row = queryOne('SELECT * FROM refund_applications WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: row });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

router.put('/:id/reject', async (req: Request, res: Response) => {
  try {
    await getDb();
    const { reject_reason } = req.body;
    const existing = queryOne('SELECT * FROM refund_applications WHERE id = ?', [req.params.id]);
    if (!existing) {
      res.status(404).json({ success: false, error: '退还申请不存在' });
      return;
    }
    if ((existing as any).status !== 'pending') {
      res.status(400).json({ success: false, error: '只能拒绝待审批状态的申请' });
      return;
    }
    run(
      `UPDATE refund_applications SET status = 'rejected', reject_reason = ?, updated_at=datetime('now','localtime') WHERE id = ?`,
      [reject_reason || '审批拒绝', req.params.id]
    );
    const row = queryOne('SELECT * FROM refund_applications WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: row });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

export default router;
