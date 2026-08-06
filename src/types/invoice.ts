export interface RowItem {
  id: string;
  description: string;
  qty: string; // free text, e.g. "9", "3 ROLL", "SUM"
  unitRate: string; // stored as raw string
  timeline: string;
}

export interface Section {
  id: string;
  title: string;
  timeline: string;
  rows: RowItem[];
}

export interface Term {
  title: string;
  text: string;
}

export interface HeaderData {
  clientName: string;
  projectType: string;
  date: string; // ISO yyyy-mm-dd
  documentTitle: string;
}

export interface FooterData {
  phone1: string;
  phone2: string;
  email: string;
  instagram: string;
  facebook: string;
}
