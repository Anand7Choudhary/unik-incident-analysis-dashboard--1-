export interface RawIncident {
  'Date of the incident?': number | string;
  'Team reporter?': string;
  'client number': number;
  'date of birth': number | string;
  'Notification is about:': string;
  'Would you like to report a customer fall?': 'Yes' | 'No';
  'Would you like to report an incident involving MEDICATION?': 'Yes' | 'No';
  'Would you like to report a security incident?': 'Yes' | 'No';
  'Suicide report / thoughts about suicide?': 'Yes' | 'No';
  'Would you like to report an aggression or inappropriate behavior incident? Verbal or physical?': 'Yes' | 'No';
  'Is the aggression or transgressive behavior verbal, physical or both?': string;
  'Would you like to complete an incident reporting - Other -?': 'Yes' | 'No';
  'consequence(s) for the victim(s)?': string;
  'What was the impact of the incident on YOU as a SUPPORTER? (0-10)': number;
  'What do you think was the impact on the CLIENT whose file you are currently working on? (0-10)': number;
  'Description of the incident.': string;
}

export interface ProcessedIncident {
  id: string;
  incidentDate: Date;
  team: string;
  clientId: number;
  clientDob: Date;
  notificationAbout: string; // Product/Form of Care
  isFallIncident: boolean;
  isMedicationIncident: boolean;
  isSecurityIncident: boolean;
  isSuicideIncident: boolean;
  isAggressionIncident: boolean;
  isOtherIncident: boolean;
  aggressionType?: string;
  victimConsequences: string;
  supporterImpactScore: number;
  clientImpactScore: number;
  description: string;
  // Engineered features
  incidentCategory: 'Fall' | 'Medication' | 'Security' | 'Suicide' | 'Aggression' | 'Other' | 'Unknown';
  seriousnessScore: 1 | 2 | 3 | 4 | 5;
  fundingSource: 'Youth Law' | 'WMO';
}

export interface Filters {
  team: string;
  product: string;
  fundingSource: string;
  seriousness: string | number;
  category: string;
  clientId: string;
  dateRange: {
    start: string | null;
    end: string | null;
  };
}

// AI Chat Assistant Types
export interface KpiData {
  value: string;
  label: string;
  description?: string;
}

export interface TableData {
  headers: string[];
  rows: (string | number)[][];
}

export interface ChartData {
  labels: string[];
  values: number[];
  chartType: 'bar' | 'pie' | 'line';
}

export interface StructuredResponse {
  responseType: 'text' | 'kpi' | 'table' | 'chart';
  title: string;
  summary: string;
  data: {
    text?: string;
    kpi?: KpiData;
    table?: TableData;
    chart?: ChartData;
  };
}