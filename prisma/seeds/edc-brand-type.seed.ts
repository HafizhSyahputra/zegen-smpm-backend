import { Prisma } from '@prisma/client';

export const EdcBrandTypeSeed: Prisma.EdcBrandTypeCreateInput[] = [
  {
    brand: 'INGENICO',
    type: 'IWL 220 - WIFI',
  },
  {
    brand: 'INGENICO',
    type: 'ICT 220',
  },
  {
    brand: 'INGENICO',
    type: 'ICT 250',
  },
  {
    brand: 'INGENICO',
    type: 'MOVE 2500',
  },
  {
    brand: 'PAX',
    type: 'D210',
  },
  {
    brand: 'VERIFONE',
    type: 'C680',
  },
  {
    brand: 'ANDROID',
    type: 'IP001',
  },
  {
    brand: 'ANDROID',
    type: 'SMARTPEAK',
  },
  {
    brand: 'INGENICO',
    type: 'IWL 220 - Embedded',
  },
  {
    brand: 'VERIFONE',
    type: 'X990 (Android)',
  },
  {
    brand: 'INGENICO',
    type: 'IWL 220',
  },
];
