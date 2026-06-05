import { Router, type Request, type Response } from 'express';
import { getDb, queryAll, queryOne, run } from '../db.js';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    await getDb();
    const rows = queryAll(
      `SELECT pv.*, r.applicant_name as refund_applicant, r.section_id,
              s.section_name
       FROM payment_vouchers pv
       LEFT JOIN refund_applications r ON pv.refund_id = r.id
       LEFT JOIN sections s ON r.section_id = s.id
       ORDER BY pv.id DESC`
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    await getDb();
    const { refund_id, voucher_no, amount, pay_date } = req.body;
    if (!refund_id || !voucher_no || !amount || !pay_date) {
      res.status(400).json({ success: false, error: '退还申请、凭证号、金额、付款日期为必填' });
      return;
    }
    const refund = queryOne('SELECT * FROM refund_applications WHERE id = ?', [refund_id]);
    if (!refund) {
      res.status(400).json({ success: false, error: '关联退还申请不存在' });
      return;
    }
    if ((refund as any).status !== 'approved') {
      res.status(400).json({ success: false, error: '只能为已审批通过的退还申请登记凭证' });
      return;
    }
    run(
      `INSERT INTO payment_vouchers (refund_id, voucher_no, amount, pay_date, status) VALUES (?, ?, ?, ?, 'issued')`,
      [refund_id, voucher_no, amount, pay_date]
    );
    run(
      `UPDATE refund_applications SET status = 'paid', updated_at=datetime('now','localtime') WHERE id = ?`,
      [refund_id]
    );
    run(
      `UPDATE bonds SET status = 'refunded' WHERE id = ?`,
      [(refund as any).bond_id]
    );
    const row = queryOne('SELECT * FROM payment_vouchers WHERE rowid = last_insert_rowid()');
    res.json({ success: true, data: row });
  } catch (err: any) {
    if (String(err).includes('UNIQUE constraint failed')) {
      res.status(400).json({ success: false, error: '凭证号已存在' });
      return;
    }
    res.status(500).json({ success: false, error: String(err) });
  }
});

export default router;
