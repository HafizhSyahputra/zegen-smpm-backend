import { Prisma } from '@prisma/client';

export const VendorSeed: Prisma.VendorCreateManyInput[] = [
  {
    code: 'MTI',
    name: 'PT Mitran Transaksi Indonesia',
  },
];
