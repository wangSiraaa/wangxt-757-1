import { Router, type Request, type Response } from 'express';
import { getDb, queryAll, queryOne, run } from '../db.js';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    await getDb();
    const rows = queryAll(
      `SELECT m.*, s.section_name, s.section_code
       FROM supplementary_materials m
       LEFT JOIN sections s ON m.section_id = s.id
       ORDER BY m.id DESC`
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

router.get('/section/:sectionId', async (req: Request, res: Response) => {
  try {
    await getDb();
    const rows = queryAll(
      `SELECT m.*, s.section_name, s.section_code
       FROM supplementary_materials m
       LEFT JOIN sections s ON m.section_id = s.id
       WHERE m.section_id = ?
       ORDER BY m.id DESC`,
      [req.params.sectionId]
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
      `SELECT m.*, s.section_name, s.section_code
       FROM supplementary_materials m
       LEFT JOIN sections s ON m.section_id = s.id
       WHERE m.id = ?`,
      [req.params.id]
    );
    if (!row) {
      res.status(404).json({ success: false, error: '补充材料不存在' });
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
    const { section_id, material_name, material_type, description, file_url } = req.body;
    if (!section_id || !material_name || !material_type || !description) {
      res.status(400).json({ success: false, error: '标段、材料名称、材料类型、描述为必填' });
      return;
    }

    const section = queryOne('SELECT * FROM sections WHERE id = ?', [section_id]);
    if (!section) {
      res.status(400).json({ success: false, error: '关联标段不存在' });
      return;
    }

    run(
      `INSERT INTO supplementary_materials (section_id, material_name, material_type, description, file_url, status) 
       VALUES (?, ?, ?, ?, ?, 'pending')`,
      [section_id, material_name, material_type, description, file_url || null]
    );
    const row = queryOne('SELECT * FROM supplementary_materials WHERE rowid = last_insert_rowid()');
    res.json({ success: true, data: row });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    await getDb();
    const { material_name, material_type, description, file_url } = req.body;
    const existing = queryOne('SELECT * FROM supplementary_materials WHERE id = ?', [req.params.id]);
    if (!existing) {
      res.status(404).json({ success: false, error: '补充材料不存在' });
      return;
    }
    run(
      `UPDATE supplementary_materials 
       SET material_name=?, material_type=?, description=?, file_url=?, updated_at=datetime('now','localtime') 
       WHERE id=?`,
      [
        material_name ?? (existing as any).material_name,
        material_type ?? (existing as any).material_type,
        description ?? (existing as any).description,
        file_url ?? (existing as any).file_url,
        req.params.id,
      ]
    );
    const row = queryOne('SELECT * FROM supplementary_materials WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: row });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

router.put('/:id/submit', async (req: Request, res: Response) => {
  try {
    await getDb();
    const existing = queryOne('SELECT * FROM supplementary_materials WHERE id = ?', [req.params.id]);
    if (!existing) {
      res.status(404).json({ success: false, error: '补充材料不存在' });
      return;
    }
    if ((existing as any).status !== 'pending') {
      res.status(400).json({ success: false, error: '只能提交待提交状态的材料' });
      return;
    }
    run(
      `UPDATE supplementary_materials 
       SET status='submitted', submitted_at=datetime('now','localtime'), updated_at=datetime('now','localtime') 
       WHERE id=?`,
      [req.params.id]
    );
    const row = queryOne('SELECT * FROM supplementary_materials WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: row });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

router.put('/:id/approve', async (req: Request, res: Response) => {
  try {
    await getDb();
    const existing = queryOne('SELECT * FROM supplementary_materials WHERE id = ?', [req.params.id]);
    if (!existing) {
      res.status(404).json({ success: false, error: '补充材料不存在' });
      return;
    }
    if ((existing as any).status !== 'submitted') {
      res.status(400).json({ success: false, error: '只能审批已提交状态的材料' });
      return;
    }
    run(
      `UPDATE supplementary_materials 
       SET status='approved', reviewed_at=datetime('now','localtime'), updated_at=datetime('now','localtime') 
       WHERE id=?`,
      [req.params.id]
    );
    const row = queryOne('SELECT * FROM supplementary_materials WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: row });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

router.put('/:id/reject', async (req: Request, res: Response) => {
  try {
    await getDb();
    const { review_comment } = req.body;
    const existing = queryOne('SELECT * FROM supplementary_materials WHERE id = ?', [req.params.id]);
    if (!existing) {
      res.status(404).json({ success: false, error: '补充材料不存在' });
      return;
    }
    if ((existing as any).status !== 'submitted') {
      res.status(400).json({ success: false, error: '只能拒绝已提交状态的材料' });
      return;
    }
    run(
      `UPDATE supplementary_materials 
       SET status='rejected', review_comment=?, reviewed_at=datetime('now','localtime'), updated_at=datetime('now','localtime') 
       WHERE id=?`,
      [review_comment || '材料不符合要求', req.params.id]
    );
    const row = queryOne('SELECT * FROM supplementary_materials WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: row });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await getDb();
    const existing = queryOne('SELECT * FROM supplementary_materials WHERE id = ?', [req.params.id]);
    if (!existing) {
      res.status(404).json({ success: false, error: '补充材料不存在' });
      return;
    }
    if ((existing as any).status !== 'pending') {
      res.status(400).json({ success: false, error: '只能删除待提交状态的材料' });
      return;
    }
    run('DELETE FROM supplementary_materials WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

export default router;
