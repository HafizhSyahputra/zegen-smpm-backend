import { Prisma } from '@prisma/client';

export const RoleSeed: Prisma.RoleCreateInput[] = [
  {
    code: 'SPR',
    name: 'Superadmin',
    type: 'PUSAT',
    User: {
      create: [
        {
          name: 'Superadmin',
          email: 'superadmin@smpm.bni.co.id',
          password:
            '$2b$12$aoJNVmdqFSg229bazPmKi..Amkaou9Hdbel/4Qn2/zV9m7m.X7zWS',
          npp: '238573928679',
        },
      ],
    },
  },
  {
    code: 'EDM',
    name: 'JO Non Agen46',
    type: 'PUSAT',
    User: {
      create: [
        {
          name: 'EDM User 1',
          email: 'edmuser1@smpm.bni.co.id',
          password:
            '$2b$12$aoJNVmdqFSg229bazPmKi..Amkaou9Hdbel/4Qn2/zV9m7m.X7zWS',
          npp: '623879823756',
        },
        {
          name: 'EDM User 2',
          email: 'edmuser2@smpm.bni.co.id',
          password:
            '$2b$12$aoJNVmdqFSg229bazPmKi..Amkaou9Hdbel/4Qn2/zV9m7m.X7zWS',
          npp: '923798673269',
        },
      ],
    },
  },
  {
    code: 'EDR',
    name: 'JO Agen46',
    type: 'PUSAT',
    User: {
      create: [
        {
          name: 'EDR User 1',
          email: 'edruser1@smpm.bni.co.id',
          password:
            '$2b$12$aoJNVmdqFSg229bazPmKi..Amkaou9Hdbel/4Qn2/zV9m7m.X7zWS',
          npp: '74872986',
        },
        {
          name: 'EDR User 2',
          email: 'edruser2@smpm.bni.co.id',
          password:
            '$2b$12$aoJNVmdqFSg229bazPmKi..Amkaou9Hdbel/4Qn2/zV9m7m.X7zWS',
          npp: '23678943759',
        },
      ],
    },
  },
  {
    code: 'VDRP',
    name: 'Vendor Pusat',
    type: 'VENDOR',
    User: {
      create: [
        {
          name: 'MTI User Pusat',
          email: 'mtipusat@smpm.bni.co.id',
          password:
            '$2b$12$aoJNVmdqFSg229bazPmKi..Amkaou9Hdbel/4Qn2/zV9m7m.X7zWS',
          npp: '46843769834',
          vendor_id: 1,
        },
      ],
    },
  },
  {
    code: 'VDRT',
    name: 'Vendor Teknisi',
    type: 'VENDOR',
    User: {
      create: [
        {
          name: 'MTI User Teknisi',
          email: 'mtiteknisi@smpm.bni.co.id',
          password:
            '$2b$12$aoJNVmdqFSg229bazPmKi..Amkaou9Hdbel/4Qn2/zV9m7m.X7zWS',
          npp: '4759348670',
          vendor_id: 1,
        },
      ],
    },
  },
];
