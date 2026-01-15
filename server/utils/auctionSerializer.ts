import type { Prisma } from '@prisma/client';

const toLowerEnum = (value: string | null | undefined) => (value ? value.toLowerCase() : value);

const toNumber = (value: Prisma.Decimal | number | null | undefined) => {
  if (value === null || value === undefined) return undefined;
  return Number(value);
};

// Optymalizacja: SELECT tylko potrzebnych pól zamiast całych obiektów
export const baseAuctionInclude = {
  pigeon: {
    select: {
      ringNumber: true,
      eyeColor: true,
      featherColor: true,
      construction: true,
      vitality: true,
      length: true,
      endurance: true,
      forkStrength: true,
      forkAlignment: true,
      muscles: true,
      balance: true,
      back: true,
      purpose: true,
      gender: true,
    }
  } as any,
  seller: {
    select: {
      id: true,
      first_name: true,
      last_name: true,
      email: true,
      phone: true,
      avatarUrl: true,
      role: true,
    }
  } as any,
  _count: {
    select: {
      bids: true,
      watchlist: true,
    },
  },
} satisfies Prisma.AuctionInclude;

export const listAuctionInclude = {
  ...baseAuctionInclude,
  bids: {
    select: {
      id: true,
      amount: true,
      createdAt: true,
      bidder: {
        select: {
          id: true,
          first_name: true,
          last_name: true,
          email: true,
          phone: true,
          avatarUrl: true,
          role: true,
        }
      } as any
    },
    orderBy: {
      createdAt: 'desc' as const,
    },
    take: 5,
  },
} satisfies Prisma.AuctionInclude;

export const detailAuctionInclude = {
  ...baseAuctionInclude,
  bids: {
    select: {
      id: true,
      amount: true,
      createdAt: true,
      bidder: {
        select: {
          id: true,
          first_name: true,
          last_name: true,
          email: true,
          phone: true,
          avatarUrl: true,
          role: true,
        }
      } as any
    },
    orderBy: {
      createdAt: 'desc' as const,
    },
  },
} satisfies Prisma.AuctionInclude;

export type AuctionEntity = Prisma.AuctionGetPayload<{
  include: typeof detailAuctionInclude;
}>;

export type AuctionListEntity = Prisma.AuctionGetPayload<{
  include: typeof listAuctionInclude;
}>;

export const bidInclude = {
  bidder: true,
} satisfies Prisma.BidInclude;

export type BidEntity = Prisma.BidGetPayload<{
  include: { bidder: true };
}>;

export function serializePigeon(pigeon: Record<string, unknown> | null | undefined) {
  if (!pigeon) return undefined;
  return {
    ringNumber: (pigeon.ringNumber as string) ?? '',
    eyeColor: (pigeon.eyeColor as string) ?? '',
    pigeonColor: (pigeon.featherColor as string) ?? '',
    construction: (pigeon.construction as string) ?? '',
    vitality: (pigeon.vitality as string) ?? '',
    length: (pigeon.length as string) ?? '',
    endurance: (pigeon.endurance as string) ?? '',
    forkStrength: (pigeon.forkStrength as string) ?? '',
    forkAlignment: (pigeon.forkAlignment as string) ?? '',
    muscles: (pigeon.muscles as string) ?? '',
    balance: (pigeon.balance as string) ?? '',
    back: (pigeon.back as string) ?? '',
    purpose: (pigeon.purpose as string) ?? '',
    gender: toLowerEnum(pigeon.gender as string) as 'male' | 'female' | undefined,
    achievements: '', // legacy field
  };
}

function maskPhone(phone?: string | null): string | undefined {
  if (!phone) return undefined;
  // Zamaskuj numer telefonu: +48******789
  if (phone.length >= 9) {
    return phone.substring(0, 3) + '******' + phone.substring(phone.length - 3);
  }
  return '***';
}

function canViewContact(auction: AuctionEntity | AuctionListEntity, userId?: string): boolean {
  if (!userId) return false;
  // Właściciel może widzieć dane kontaktowe
  if (auction.sellerId === userId) return true;
  // Zwycięzca może widzieć dane sprzedającego
  if (auction.winnerId === userId) return true;
  return false;
}

export function serializePublicUser(user: Record<string, unknown> | null, showContact = false) {
  if (!user) return null;
  const displayName = (user.first_name as string | undefined) || (user.email as string | undefined)?.split('@')[0] || 'Użytkownik';
  return {
    id: String(user.id),
    username: displayName,
    firstName: showContact ? ((user.first_name as string | undefined) ?? (user.firstName as string | undefined) ?? 'Użytkownik') : undefined,
    lastName: showContact ? ((user.last_name as string | undefined) ?? (user.lastName as string | undefined) ?? '') : undefined,
    // PII removed - email and phone only visible to owner/admin
    email: showContact && (user.role === 'ADMIN' || user.isOwner) ? ((user.email as string | undefined) ?? '') : undefined,
    phoneNumber: showContact && (user.role === 'ADMIN' || user.isOwner) ? ((user.phone as string | undefined) ?? '') : undefined,
    image: (user.avatarUrl as string | undefined) ?? (user.avatar_url as string | undefined) ?? null,
    rating: 5.0,
    salesCount: 0,
  };
}

export function serializeBid(bid: BidEntity, showContact = false) {
  const bidderAny = bid.bidder as Record<string, unknown> | null;
  return {
    id: bid.id,
    amount: Number(bid.amount),
    bidder: serializePublicUser(bidderAny, showContact),
    createdAt: bid.createdAt instanceof Date ? bid.createdAt.toISOString() : (bid.createdAt as unknown as string),
  };
}

export function serializeAuction<T extends AuctionEntity | AuctionListEntity>(auction: T, options: { isOwner?: boolean; userId?: string } = {}) {
  const { isOwner = false, userId } = options;
  const sellerAny = auction.seller as Record<string, unknown> | null;
  const showContact = isOwner || canViewContact(auction, userId);
  
  return {
    id: auction.id,
    title: auction.title,
    description: auction.description ?? '',
    startingPrice: toNumber(auction.startingPrice),
    currentPrice: Number(auction.currentPrice || 0),
    buyNowPrice: toNumber(auction.buyNowPrice),
    reservePrice: toNumber(auction.reservePrice),
    endTime: auction.endTime instanceof Date ? auction.endTime.toISOString() : (auction.endTime as unknown as string),
    snipeThresholdMinutes: auction.snipeThresholdMinutes ?? 5,
    snipeExtensionMinutes: auction.snipeExtensionMinutes ?? 5,
    minBidIncrement: auction.minBidIncrement ?? 100,
    status: toLowerEnum(auction.status) as 'active' | 'ended' | 'cancelled' | undefined,
    reserveMet: !!auction.reserveMet,
    category: toLowerEnum(auction.category) ?? 'ogólna',
    pigeon: serializePigeon((auction as any).pigeon),
    sex: toLowerEnum(auction.sex) as 'male' | 'female' | undefined,
    location: auction.location ?? '',
    seller: serializePublicUser(sellerAny, showContact),
    images: Array.isArray((auction as any).auctionImages) ? (auction as any).auctionImages.map((i: any) => i.url) : [],
    videos: Array.isArray((auction as any).auctionVideos) ? (auction as any).auctionVideos.map((v: any) => v.url) : [],
    documents: Array.isArray((auction as any).auctionDocuments) ? (auction as any).auctionDocuments.map((d: any) => d.url) : [],
    bids: Array.isArray(auction.bids) ? auction.bids.map((b) => serializeBid(b as BidEntity, showContact)) : [],
    _count: auction._count ?? { bids: 0, watchlist: 0 },
    canViewContact,
  };
}

// Public serializer - tylko username, bez email/phone
export function serializePublicAuction<T extends AuctionEntity | AuctionListEntity>(auction: T, userId?: string) {
  return serializeAuction(auction, { isOwner: false, userId });
}

// Private serializer - pełne dane tylko dla owner/admin
export function serializePrivateAuction<T extends AuctionEntity | AuctionListEntity>(auction: T, userId?: string) {
  const isOwner = auction.sellerId === userId;
  return serializeAuction(auction, { isOwner, userId });
}

export type AuctionDTO = ReturnType<typeof serializeAuction>;
export type BidDTO = ReturnType<typeof serializeBid>;
