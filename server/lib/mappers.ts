export function mapDbStatusToApi(status: string | null | undefined, endsAt: string | null | undefined): 'active' | 'ended' | 'cancelled' {
  if (status === 'cancelled') return 'cancelled';
  if (status === 'open') {
    if (endsAt && new Date(endsAt) <= new Date()) return 'ended';
    return 'active';
  }
  return 'ended';
}

export function mapUserToSeller(user: any, fallback: { id: string; email?: string } | null) {
  const rawName = String(user?.name || user?.full_name || user?.email || fallback?.email || '').trim();
  const parts = rawName.split(/\s+/).filter(Boolean);
  const firstName = parts[0] || 'Użytkownik';
  const lastName = parts.slice(1).join(' ');

  return {
    id: String(user?.id || fallback?.id || ''),
    firstName,
    lastName,
    email: String(user?.email || fallback?.email || ''),
    phoneNumber: String(user?.phone || ''),
    image: null,
    rating: 0,
    salesCount: 0,
  };
}

export function mapDbAuctionToApiAuction(db: any, ownerUser: any | null) {
  const endsAt = db?.ends_at ? String(db.ends_at) : null;
  const status = mapDbStatusToApi(db?.status, endsAt);

  const startingPrice = Number(db?.starting_price ?? 0);
  const currentPrice = Number(db?.current_price ?? 0);
  const reservePrice = db?.reserve_price != null ? Number(db.reserve_price) : undefined;
  const buyNowPrice = db?.buy_now_price != null ? Number(db.buy_now_price) : undefined;

  const seller = mapUserToSeller(ownerUser, { id: String(db?.owner_id || ''), email: ownerUser?.email });

  const pigeon = db?.pigeon && typeof db.pigeon === 'object' ? db.pigeon : {};
  const images = Array.isArray(db?.images) ? db.images : [];
  const videos = Array.isArray(db?.videos) ? db.videos : [];
  const documents = Array.isArray(db?.documents) ? db.documents : [];

  return {
    id: String(db?.id),
    title: String(db?.title || ''),
    description: String(db?.description || ''),
    startingPrice,
    currentPrice,
    buyNowPrice,
    reservePrice,
    endTime: endsAt || new Date().toISOString(),
    snipeThresholdMinutes: Number(db?.snipe_threshold_minutes ?? 2),
    snipeExtensionMinutes: Number(db?.snipe_extension_minutes ?? 2),
    minBidIncrement: Number(db?.min_bid_increment ?? 100),
    status,
    reserveMet: Boolean(db?.reserve_met ?? true),
    category: (db?.category as any) || 'pigeons',
    pigeon,
    age: Number(db?.age ?? 0),
    sex: (db?.sex as any) || pigeon?.gender || 'male',
    location: String(db?.location || ''),
    seller,
    images,
    videos,
    documents,
    bids: [] as any[],
    createdAt: db?.created_at ? String(db.created_at) : new Date().toISOString(),
    updatedAt: db?.updated_at ? String(db.updated_at) : new Date().toISOString(),
    _count: {
      watchlist: Number(db?.watchlist_count ?? 0) || 0,
      bids: Number(db?.bids_count ?? 0) || 0,
    },
  };
}
