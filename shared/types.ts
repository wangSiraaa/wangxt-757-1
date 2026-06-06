export interface Section {
  id: number;
  project_name: string;
  section_code: string;
  section_name: string;
  open_date: string | null;
  status: 'unopened' | 'opened' | 'awarded' | 'contracted';
  created_at: string;
  updated_at: string;
}

export interface Bond {
  id: number;
  section_id: number;
  payer_name: string;
  amount: number;
  bond_date: string;
  status: 'paid' | 'refunded' | 'partial_refunded';
  created_at: string;
  section_name?: string;
  section_code?: string;
}

export interface BidResult {
  id: number;
  section_id: number;
  winner_name: string;
  award_date: string;
  contract_signed: boolean;
  created_at: string;
  section_name?: string;
  section_code?: string;
}

export interface RefundApplication {
  id: number;
  bond_id: number;
  section_id: number;
  applicant_name: string;
  amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  reject_reason: string | null;
  created_at: string;
  updated_at: string;
  section_name?: string;
  section_code?: string;
  bond_payer?: string;
}

export interface PaymentVoucher {
  id: number;
  refund_id: number;
  voucher_no: string;
  amount: number;
  pay_date: string;
  status: 'issued' | 'confirmed';
  created_at: string;
  refund_applicant?: string;
  section_name?: string;
}

export interface SupplementaryMaterial {
  id: number;
  section_id: number;
  material_name: string;
  material_type: string;
  description: string;
  file_url?: string;
  status: 'pending' | 'submitted' | 'approved' | 'rejected';
  submitted_by?: string;
  submitted_at?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  review_comment?: string;
  created_at: string;
  updated_at: string;
  section_name?: string;
  section_code?: string;
}

export type MaterialStatus = SupplementaryMaterial['status'];

export const MATERIAL_STATUS_MAP: Record<MaterialStatus, string> = {
  pending: '待提交',
  submitted: '已提交',
  approved: '已通过',
  rejected: '已拒绝',
};

export type SectionStatus = Section['status'];
export type BondStatus = Bond['status'];
export type RefundStatus = RefundApplication['status'];
export type VoucherStatus = PaymentVoucher['status'];

export const SECTION_STATUS_MAP: Record<SectionStatus, string> = {
  unopened: '未开标',
  opened: '已开标',
  awarded: '已定标',
  contracted: '已签约',
};

export const BOND_STATUS_MAP: Record<BondStatus, string> = {
  paid: '已缴纳',
  refunded: '已退还',
  partial_refunded: '部分退还',
};

export const REFUND_STATUS_MAP: Record<RefundStatus, string> = {
  pending: '待审批',
  approved: '已通过',
  rejected: '已拒绝',
  paid: '已付款',
};

export const VOUCHER_STATUS_MAP: Record<VoucherStatus, string> = {
  issued: '已开具',
  confirmed: '已确认',
};
