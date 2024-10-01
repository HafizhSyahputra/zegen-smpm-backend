import { PrismaClient } from '@prisma/client';
import { EdcBrandTypeSeed } from './edc-brand-type.seed';
import { RegionSeed } from './region.seed';
import { VendorSeed } from './vendor.seed';
import { RoleSeed } from './role.seed';

const prisma = new PrismaClient();

async function main() {
  const edcBrandType = await prisma.edcBrandType.createMany({
    data: EdcBrandTypeSeed,
  });
  const region = await prisma.region.createMany({
    data: RegionSeed,
  });
  const vendor = await prisma.vendor.createMany({
    data: VendorSeed,
  });
  await Promise.all(
    RoleSeed.map((item) =>
      prisma.role.create({
        data: item,
      }),
    ),
  );

  console.log({ edcBrandType, region, vendor });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
