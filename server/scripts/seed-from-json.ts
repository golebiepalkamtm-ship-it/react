import 'dotenv/config';
import fs from 'fs';
import path from 'path';

async function main() {
  // Initialize Prisma with PG adapter
  const { PrismaPg } = await import('@prisma/adapter-pg' as any);
  const { PrismaClient } = await import('@prisma/client' as any);
  const adapter = new (PrismaPg as any)({ connectionString: process.env.DATABASE_URL });
  const prisma = new (PrismaClient as any)({ adapter });

  const dataPath = path.join(process.cwd(), 'data', 'auctions.json');
  const raw = fs.readFileSync(dataPath, 'utf8');
  const parsed = JSON.parse(raw);
  const auctions = Array.isArray(parsed.auctions) ? parsed.auctions : [];

  for (const a of auctions) {
    const sellerId = a.seller?.id ?? `seller-${Date.now()}`;
    // Upsert seller user
    await prisma.user.upsert({
      where: { id: sellerId },
      update: {},
      create: {
        id: sellerId,
        email: a.seller?.email ?? null,
        phone: a.seller?.phoneNumber ?? null,
        name: `${a.seller?.firstName ?? 'Sprzedający'} ${a.seller?.lastName ?? ''}`.trim(),
        role: 'USER_FULL_VERIFIED',
      },
    });

    // Create auction
    await prisma.auction.create({
      data: {
        id: a.id,
        title: a.title,
        description: a.description ?? '',
        startingPrice: a.startingPrice != null ? Number(a.startingPrice) : null,
        currentPrice: Number(a.currentPrice ?? a.startingPrice ?? 0),
        buyNowPrice: a.buyNowPrice != null ? Number(a.buyNowPrice) : null,
        reservePrice: a.reservePrice != null ? Number(a.reservePrice) : null,
        endTime: new Date(a.endTime),
        snipeThresholdMinutes: a.snipeThresholdMinutes ?? 5,
        snipeExtensionMinutes: a.snipeExtensionMinutes ?? 5,
        minBidIncrement: a.minBidIncrement ?? 100,
        status: 'ACTIVE',
        reserveMet: !!a.reserveMet,
        category: String(a.category ?? 'Gołębie'),
        sex: String(a.sex ?? a.pigeon?.gender ?? 'male').toUpperCase(),
        location: a.location ?? 'Lubań, Polska',
        sellerId,
        pigeon: a.pigeon
          ? {
              create: {
                ringNumber: a.pigeon.ringNumber ?? a.pigeon.records?.[0] ?? '',
                eyeColor: a.pigeon.eyeColor ?? '',
                pigeonColor: a.pigeon.pigeonColor ?? a.pigeon.featherColor ?? '',
                construction: a.pigeon.construction ?? '',
                pedigreeUrl: a.pigeon.pedigreeUrl ?? a.pigeon.pedigree ?? '',
                vitality: a.pigeon.vitality ?? '',
                length: a.pigeon.length ?? '',
                endurance: a.pigeon.endurance ?? '',
                forkStrength: a.pigeon.forkStrength ?? '',
                forkAlignment: a.pigeon.forkAlignment ?? '',
                muscles: a.pigeon.muscles ?? '',
                balance: a.pigeon.balance ?? '',
                back: a.pigeon.back ?? '',
                purpose: a.pigeon.purpose ?? '',
                gender: String(a.pigeon.gender ?? 'male').toUpperCase(),
              },
            }
          : undefined,
        images: Array.isArray(a.images) && a.images.length ? { create: a.images.map((url: string) => ({ url })) } : undefined,
        videos: Array.isArray(a.videos) && a.videos.length ? { create: a.videos.map((url: string) => ({ url })) } : undefined,
        documents: Array.isArray(a.documents) && a.documents.length ? { create: a.documents.map((url: string) => ({ url })) } : undefined,
      },
    });

    // Seed bids and bidder users
    if (Array.isArray(a.bids)) {
      for (const b of a.bids) {
        const bidderId = b.bidder?.id ?? `user-${Date.now()}`;
        await prisma.user.upsert({
          where: { id: bidderId },
          update: {},
          create: {
            id: bidderId,
            email: null,
            phone: null,
            name: `${b.bidder?.firstName ?? 'Użytkownik'} ${b.bidder?.lastName ?? ''}`.trim(),
            role: 'USER_FULL_VERIFIED',
          },
        });
        await prisma.bid.create({
          data: {
            id: b.id,
            auctionId: a.id,
            bidderId,
            amount: Number(b.amount ?? 0),
            createdAt: new Date(b.createdAt ?? Date.now()),
          },
        });
      }
    }
  }

  await prisma.$disconnect();
  
  console.log(`Seeded ${auctions.length} auctions from JSON`);
}

main().catch((e) => {
  
  console.error(e);
  process.exit(1);
});
