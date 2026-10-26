import { DistrictInfo, DivisionName } from '../types';
import districtsRaw from './districtsInfo.json';

export const DISTRICTS: DistrictInfo[] = districtsRaw as DistrictInfo[];

export const DISTRICTS_BY_ID: Record<string, DistrictInfo> = DISTRICTS.reduce(
  (acc, d) => {
    acc[d.id] = d;
    return acc;
  },
  {} as Record<string, DistrictInfo>
);

export const DISTRICTS_BY_SHAPE_NAME: Record<string, DistrictInfo> = DISTRICTS.reduce(
  (acc, d) => {
    acc[d.shapeName] = d;
    return acc;
  },
  {} as Record<string, DistrictInfo>
);

export const DIVISIONS: {
  en: Exclude<DivisionName, 'All'>;
  bn: string;
  districtsCount: number;
  color: string;
}[] = [
  { en: 'Dhaka', bn: 'ঢাকা', districtsCount: 13, color: '#3B82F6' },
  { en: 'Chattogram', bn: 'চট্টগ্রাম', districtsCount: 11, color: '#10B981' },
  { en: 'Rajshahi', bn: 'রাজশাহী', districtsCount: 8, color: '#F59E0B' },
  { en: 'Khulna', bn: 'খুলনা', districtsCount: 10, color: '#06B6D4' },
  { en: 'Barishal', bn: 'বরিশাল', districtsCount: 6, color: '#8B5CF6' },
  { en: 'Sylhet', bn: 'সিলেট', districtsCount: 4, color: '#EC4899' },
  { en: 'Rangpur', bn: 'রংপুর', districtsCount: 8, color: '#14B8A6' },
  { en: 'Mymensingh', bn: 'ময়মনসিংহ', districtsCount: 4, color: '#F97316' },
];

export const DEMO_VISITED_IDS = [
  'dhaka',
  'coxs-bazar',
  'chattogram',
  'sylhet',
  'moulvibazar',
  'bandarban',
  'rangamati',
  'khulna',
  'bagerhat',
  'bogura',
  'rajshahi',
  'barishal',
  'panchagarh',
  'netrokona'
];
