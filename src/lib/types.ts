export interface Company {
  Number: string;
  CompanyNameProject: string;
  Brand?: string;
  LicenseApprovalNumber?: string;
  GovernorateName?: string;
  GrantingLicenseApproval?: string;
  LicenseApprovalDate?: string;
  LicenseTextSpecialization?: string;
  CargoDetails?: string;
  TypeIndustryProduction?: string;
  Unit?: string;
}
export interface DocumentRecord {
  id: string; doc_id: string; date_str: string; time_str: string; createdAt: string;
  subject: string; company_number: string; company_name_project: string;
  governorate_name: string; granting_license_approval: string;
  license_approval_number: string; license_approval_date: string;
  license_text_specialization: string; brand: string; item_name: string;
  production_capacity: string; unit: string; cargo_typedetails: string;
  checkpoint_name_control: string; driver_name: string;
  vehicle_number: string; registration_governorate: string;
  weight_quantity: string; destination_governorate: string;
  trader_name: string; document_value_usd: number;
  qr_image_data?: string; qr_code?: string;
}
export interface Trader { id: string; name: string; createdAt: string }
export interface Payment {
  id: string; trader_name: string; amount: number; date: string;
  type: 'receipt' | 'settlement'; reference: string; notes: string;
  createdAt: string;
}
export interface Database {
  version: 1; companies: Company[]; documents: DocumentRecord[];
  traders: Trader[]; payments: Payment[]; updatedAt: string;
}
