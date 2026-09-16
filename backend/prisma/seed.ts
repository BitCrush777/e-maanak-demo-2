import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Demo users will be created via Supabase Auth provisioning script
  // This seed creates only the application-level data

  // Create demo instrument type rules
  const weighingScaleRule = await prisma.instrumentTypeRule.upsert({
    where: { ruleCode: 'WEIGHING_SCALE_V1' },
    update: {},
    create: {
      instrumentType: 'WEIGHING_SCALE',
      ruleCode: 'WEIGHING_SCALE_V1',
      ruleVersion: '1.0',
      description: 'Demo verification rule for weighing scales (SIH 2026 Prototype)',
      isActive: true,
      toleranceConfig: {
        absoluteTolerance: '0.01',
        percentageTolerance: '1.0'
      },
      testPointSchedule: [20, 50, 100]
    }
  });

  const pressureGaugeRule = await prisma.instrumentTypeRule.upsert({
    where: { ruleCode: 'PRESSURE_GAUGE_V1' },
    update: {},
    create: {
      instrumentType: 'PRESSURE_GAUGE',
      ruleCode: 'PRESSURE_GAUGE_V1',
      ruleVersion: '1.0',
      description: 'Demo verification rule for pressure gauges (SIH 2026 Prototype)',
      isActive: true,
      toleranceConfig: {
        absoluteTolerance: '0.5',
        percentageTolerance: '2.0'
      },
      testPointSchedule: [25, 50, 75, 100]
    }
  });

  const volumetricMeasureRule = await prisma.instrumentTypeRule.upsert({
    where: { ruleCode: 'VOLUMETRIC_MEASURE_V1' },
    update: {},
    create: {
      instrumentType: 'VOLUMETRIC_MEASURE',
      ruleCode: 'VOLUMETRIC_MEASURE_V1',
      ruleVersion: '1.0',
      description: 'Demo verification rule for volumetric measures (SIH 2026 Prototype)',
      isActive: true,
      toleranceConfig: {
        absoluteTolerance: '0.005',
        percentageTolerance: '0.5'
      },
      testPointSchedule: [50, 100]
    }
  });

  console.log('Created instrument type rules:', {
    weighingScale: weighingScaleRule.id,
    pressureGauge: pressureGaugeRule.id,
    volumetricMeasure: volumetricMeasureRule.id
  });

  console.log('Seed completed successfully!');
  console.log('Note: Demo user accounts must be provisioned via the admin provisioning utility.');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
