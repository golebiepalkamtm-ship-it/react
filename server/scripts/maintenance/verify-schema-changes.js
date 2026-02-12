import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

async function verify() {
  try {
    console.log('Verifying database schema...');
    
    // Check references table
    const referencesColumns = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'references' AND table_schema = 'public';
    `;
    
    // Check auctions table
    const auctionsColumns = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'auctions' AND table_schema = 'public';
    `;

    const refCols = referencesColumns.map(c => c.column_name);
    const aucCols = auctionsColumns.map(c => c.column_name);

    console.log('Current columns in "references":', refCols);
    console.log('Current columns in "auctions":', aucCols);

    const hasBreederName = refCols.includes('breeder_name');
    const hasPigeonName = refCols.includes('pigeon_name');
    const hasIsApproved = refCols.includes('is_approved');
    const hasCreatedAt = refCols.includes('created_at');
    const hasUpdatedAt = refCols.includes('updated_at');
    
    const hasVersion = aucCols.includes('version');

    const referencesUpdated = hasBreederName && hasPigeonName && hasIsApproved && hasCreatedAt && hasUpdatedAt;

    if (referencesUpdated && hasVersion) {
      console.log('VERIFICATION SUCCESS: All schema changes are present in the database.');
    } else {
      console.log('VERIFICATION FAILED: Database does not match expected schema yet.');
      if (!referencesUpdated) console.log('Table "references" is missing renamed columns (snake_case).');
      if (!hasVersion) console.log('Table "auctions" is missing "version" column.');
      process.exit(1);
    }

  } catch (e) {
    console.error('Verification error:', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verify();
