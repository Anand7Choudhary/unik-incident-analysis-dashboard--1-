import { RawIncident, ProcessedIncident } from '../types';
import { TRANSLATION_MAP } from '../constants';

// A more robust helper to convert various date formats to a JS Date, or null if invalid.
const excelDateToJSDate = (serial: number | string | null | undefined): Date | null => {
  // 1. Handle null/undefined/empty input
  if (serial === null || serial === undefined || serial === '') {
    return null;
  }

  // 2. Handle string input (e.g., 'MM/DD/YYYY')
  if (typeof serial === 'string') {
    const parsedDate = new Date(serial);
    if (!isNaN(parsedDate.getTime())) {
      const year = parsedDate.getFullYear();
      if (year > 1900 && year < 2100) { // Sanity check for a reasonable year
        return parsedDate;
      }
    }
  }

  // 3. Handle numeric input (could be Excel serial or a mistake)
  const numSerial = Number(serial);
  if (isNaN(numSerial) || numSerial <= 0) {
    return null;
  }

  // Check if it's a plausible Unix timestamp (ms). The error numbers are large.
  // Excel serials are typically < 100000.
  if (numSerial > 100000000000) {
      const tsDate = new Date(numSerial);
      if (!isNaN(tsDate.getTime())) {
        const year = tsDate.getFullYear();
        if (year > 1900 && year < 2100) { // Sanity check
          return tsDate;
        }
      }
  }

  // Assume it's an Excel serial date and perform conversion and validation.
  // Excel's epoch is 1899-12-30. 25569 is days between that and 1970-01-01.
  if (numSerial > 0 && numSerial < 2958465) { // Range roughly between 1900 and 9999
    const utc_days = Math.floor(numSerial - 25569);
    const utc_value = utc_days * 86400;
    const date_info = new Date(utc_value * 1000);
    const finalDate = new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate());
    
    // Final sanity check on the calculated year
    const year = finalDate.getFullYear();
    if (year > 1900 && year < 2100) {
      return finalDate;
    }
  }
  
  // If all checks fail, it's an invalid date format.
  return null;
};

const translate = (text: string | undefined): string => {
  if (!text) return 'N/A';
  return TRANSLATION_MAP[text] || text;
};

const calculateSeriousnessScore = (incident: Partial<ProcessedIncident>): (1 | 2 | 3 | 4 | 5) => {
  let score = 1;
  if (incident.isSuicideIncident) return 5;

  if (incident.victimConsequences?.toLowerCase().includes('visible injury')) score += 2;
  if (incident.clientImpactScore && incident.clientImpactScore > 7) score += 2;
  if (incident.supporterImpactScore && incident.supporterImpactScore > 7) score += 1;
  
  if (score > 5) score = 5;
  return score as (1 | 2 | 3 | 4 | 5);
};

const getIncidentCategory = (incident: RawIncident): ('Fall' | 'Medication' | 'Security' | 'Suicide' | 'Aggression' | 'Other' | 'Unknown') => {
    if (incident['Suicide report / thoughts about suicide?'] === 'Yes') return 'Suicide';
    if (incident['Would you like to report an aggression or inappropriate behavior incident? Verbal or physical?'] === 'Yes') return 'Aggression';
    if (incident['Would you like to report a customer fall?'] === 'Yes') return 'Fall';
    if (incident['Would you like to report an incident involving MEDICATION?'] === 'Yes') return 'Medication';
    if (incident['Would you like to report a security incident?'] === 'Yes') return 'Security';
    if (incident['Would you like to complete an incident reporting - Other -?'] === 'Yes') return 'Other';
    return 'Unknown';
};

export const processUniKData = (rawData: RawIncident[]): ProcessedIncident[] => {
  const processedData: ProcessedIncident[] = [];

  rawData.forEach((raw, index) => {
    const incidentDate = excelDateToJSDate(raw['Date of the incident?']);
    const clientDob = excelDateToJSDate(raw['date of birth']);

    // CRITICAL VALIDATION STEP: Skip row if dates are invalid or missing.
    if (!incidentDate || !clientDob) {
      console.warn(`Skipping row ${index + 2} in Excel due to invalid or missing date.`);
      return; // Skips to the next item in the loop
    }
    
    // Additional sanity check: ensure incident date is not before DOB.
    if (incidentDate < clientDob) {
      console.warn(`Skipping row ${index + 2}: Incident date is before client's date of birth.`);
      return;
    }

    let ageAtIncident = incidentDate.getFullYear() - clientDob.getFullYear();
    const m = incidentDate.getMonth() - clientDob.getMonth();
    if (m < 0 || (m === 0 && incidentDate.getDate() < clientDob.getDate())) {
        ageAtIncident--;
    }

    const processed: Partial<ProcessedIncident> = {
      id: `${raw['client number']}-${incidentDate.getTime()}-${index}`,
      incidentDate,
      team: raw['Team reporter?'] || 'N/A',
      clientId: raw['client number'],
      clientDob,
      notificationAbout: raw['Notification is about:'] || 'N/A',
      isFallIncident: raw['Would you like to report a customer fall?'] === 'Yes',
      isMedicationIncident: raw['Would you like to report an incident involving MEDICATION?'] === 'Yes',
      isSecurityIncident: raw['Would you like to report a security incident?'] === 'Yes',
      isSuicideIncident: raw['Suicide report / thoughts about suicide?'] === 'Yes',
      isAggressionIncident: raw['Would you like to report an aggression or inappropriate behavior incident? Verbal or physical?'] === 'Yes',
      isOtherIncident: raw['Would you like to complete an incident reporting - Other -?'] === 'Yes',
      aggressionType: translate(raw['Is the aggression or transgressive behavior verbal, physical or both?']),
      victimConsequences: raw['consequence(s) for the victim(s)?'] || 'None',
      supporterImpactScore: raw['What was the impact of the incident on YOU as a SUPPORTER? (0-10)'],
      clientImpactScore: raw['What do you think was the impact on the CLIENT whose file you are currently working on? (0-10)'],
      description: raw['Description of the incident.'] || 'No description provided.',
      // Engineered features
      incidentCategory: getIncidentCategory(raw),
      fundingSource: ageAtIncident < 18 ? 'Youth Law' : 'WMO',
    };
    
    processed.seriousnessScore = calculateSeriousnessScore(processed);

    processedData.push(processed as ProcessedIncident);
  });
  
  return processedData;
};