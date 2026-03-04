import * as XLSX from 'xlsx';
import type { ImportedMentor } from '@/types';

function cleanValue(val: unknown): string | null {
  if (val === undefined || val === null || val === '') return null;
  const str = String(val).trim();
  return str || null;
}

function parseBoolFlag(val: unknown): boolean {
  if (val === undefined || val === null) return false;
  const str = String(val).trim().toLowerCase();
  return ['v', 'yes', 'true', '1', 'x', '\u2713'].includes(str);
}

function parseAlumni(val: unknown): boolean {
  if (val === undefined || val === null) return false;
  return String(val).trim().toLowerCase() === 'yes';
}

function parseArrayField(val: unknown): string[] {
  if (val === undefined || val === null) return [];
  return String(val)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export function parseExcelFile(buffer: ArrayBuffer): ImportedMentor[] {
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  // Convert to array of arrays, skipping first 4 rows (Monday.com header)
  const rawData: unknown[][] = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: null,
  });

  // Skip first 4 rows
  const dataRows = rawData.slice(4);

  const HEADERS = [
    'Name', 'Mentor Status', 'Business Name', 'Title', 'Location', 'Phone',
    'Email', 'Biography', 'FGCU Alumni', 'Resume', 'Domain Expertise',
    'Sector Expertise', 'Mentoring Program', 'Work Status', 'Potential Speaker',
    'Potential Judge', 'Mentor Coordinator', 'Veteran Status',
  ];

  const sectionHeaders = ['Current Mentors', 'Past Mentors', 'Inactive Mentors', 'Name'];

  const mentors: ImportedMentor[] = [];

  for (const row of dataRows) {
    if (!row || !row[0]) continue;

    const name = cleanValue(row[0]);
    if (!name || sectionHeaders.includes(name)) continue;

    // Check if it matches any header row
    if (HEADERS.includes(name)) continue;

    mentors.push({
      name,
      status: cleanValue(row[1]) || 'Available',
      businessName: cleanValue(row[2]),
      title: cleanValue(row[3]),
      location: cleanValue(row[4]),
      phone: cleanValue(row[5]),
      email: cleanValue(row[6]),
      biography: cleanValue(row[7]),
      fgcuAlumni: parseAlumni(row[8]),
      // row[9] is Resume - skip
      domainExpertise: parseArrayField(row[10]),
      sectorExpertise: parseArrayField(row[11]),
      programs: parseArrayField(row[12]),
      workStatus: cleanValue(row[13]),
      potentialSpeaker: parseBoolFlag(row[14]),
      potentialJudge: parseBoolFlag(row[15]),
      mentorCoordinator: cleanValue(row[16]),
      veteranStatus: cleanValue(row[17]) === 'Veteran',
    });
  }

  return mentors;
}

export function generateCSV(mentors: ImportedMentor[] | Record<string, unknown>[]): string {
  if (mentors.length === 0) return '';

  const headers = [
    'Name', 'Status', 'Business Name', 'Title', 'Location', 'Phone',
    'Email', 'Biography', 'FGCU Alumni', 'Domain Expertise', 'Sector Expertise',
    'Programs', 'Work Status', 'Potential Speaker', 'Potential Judge',
    'Mentor Coordinator', 'Veteran Status',
  ];

  const rows = mentors.map((m) => {
    const mentor = m as Record<string, unknown>;
    return [
      mentor.name,
      mentor.status,
      mentor.businessName,
      mentor.title,
      mentor.location,
      mentor.phone,
      mentor.email,
      mentor.biography,
      mentor.fgcuAlumni ? 'Yes' : 'No',
      Array.isArray(mentor.domainExpertise) ? mentor.domainExpertise.join(', ') : mentor.domainExpertise,
      Array.isArray(mentor.sectorExpertise) ? mentor.sectorExpertise.join(', ') : mentor.sectorExpertise,
      Array.isArray(mentor.programs) ? mentor.programs.join(', ') : mentor.programs,
      mentor.workStatus,
      mentor.potentialSpeaker ? 'Yes' : 'No',
      mentor.potentialJudge ? 'Yes' : 'No',
      mentor.mentorCoordinator,
      mentor.veteranStatus ? 'Yes' : 'No',
    ].map((val) => {
      if (val === null || val === undefined) return '';
      const str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    });
  });

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}
