import { z } from 'zod';
import { Auction, Bid, AuctionStatus, BidSchema, AuctionIdSchema } from '../../shared/contracts/auction.js';
import { PlaceBidRequest, PlaceBidResponse, BidErrorType } from '../../shared/contracts/bidding.js';
import { supabaseRpc } from '../lib/supabaseRest.js';
import { mapDbAuctionToApiAuction, mapUserToSeller } from '../lib/mappers.js';

export interface AuctionFilter {
  status?: string;
  search?: string;
  category?: string;
  gender?: string;
  priceMin?: number;
  priceMax?: number;
  sortBy?: string;
  limit?: number;
  ownerId?: string;
}

export class AuctionRepository {
  private supabaseUrl: string;
  private serviceKey: string;
  private headers: Record<string, string>;

  constructor() {
    this.supabaseUrl = process.env.SUPABASE_URL || '';
    this.serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    this.headers = {
      apikey: this.serviceKey,
      Authorization: `Bearer ${this.serviceKey}`,
      'Content-Type': 'application/json',
    };
  }

  private async supabaseJson<T>(url: string, init: RequestInit): Promise<T | undefined> {
    const response = await fetch(url, { ...init, headers: { ...this.headers, ...init.headers } });
    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`Supabase request failed (${response.status}): ${text}`);
    }
    if (response.status === 204) return undefined;
    const text = await response.text().catch(() => '');
    if (!text) return undefined;
    return JSON.parse(text) as T;
  }

  async findAll(filter: AuctionFilter): Promise<Auction[]> {
    if (!this.supabaseUrl || !this.serviceKey) return [];

    const url = new URL(`${this.supabaseUrl}/rest/v1/active_auctions_summary`);
    
    // Select fields
    const fields = [
      'id', 'title', 'description', 'owner_id', 'starting_price', 'current_price',
      'buy_now_price', 'reserve_price', 'reserve_met', 'ends_at', 'status',
      'category', 'pigeon', 'age', 'sex', 'location', 'images', 'videos', 'documents',
      'snipe_threshold_minutes', 'snipe_extension_minutes', 'min_bid_increment',
      'created_at', 'updated_at', 'bids_count', 'watchlist_count', 'highest_bid'
    ];
    url.searchParams.set('select', fields.join(','));

    // Apply filters
    if (filter.status && filter.status !== 'all') {
      const s = String(filter.status);
      const dbStatus = s === 'active' ? 'open' : s === 'ended' ? 'closed' : s;
      url.searchParams.set('status', `eq.${dbStatus}`);
    }

    if (filter.category && filter.category !== 'all') url.searchParams.set('category', `eq.${filter.category}`);
    if (filter.gender && filter.gender !== 'all') url.searchParams.set('sex', `eq.${filter.gender}`);
    if (filter.priceMin != null) url.searchParams.append('current_price', `gte.${filter.priceMin}`);
    if (filter.priceMax != null) url.searchParams.append('current_price', `lte.${filter.priceMax}`);
    if (filter.ownerId) url.searchParams.set('owner_id', `eq.${filter.ownerId}`);

    if (filter.search) {
      const term = String(filter.search).trim().toLowerCase();
      if (term) {
        url.searchParams.set(
          'or',
          `(title.ilike.*${term}*,description.ilike.*${term}*,pigeon->>bloodline.ilike.*${term}*)`
        );
      }
    }

    // Sort
    if (filter.sortBy === 'newest') url.searchParams.set('order', 'created_at.desc');
    else if (filter.sortBy === 'ending-soon') url.searchParams.set('order', 'ends_at.asc');
    else if (filter.sortBy === 'price-high' || filter.sortBy === 'price') url.searchParams.set('order', 'current_price.desc');
    else if (filter.sortBy === 'price-low') url.searchParams.set('order', 'current_price.asc');
    else url.searchParams.set('order', 'ends_at.asc');

    // Limit
    if (filter.limit) url.searchParams.set('limit', String(filter.limit));

    const dbAuctions = await this.supabaseJson<any[]>(url.toString(), { method: 'GET' }) || [];

    // Fetch owners
    const ownerIds = Array.from(new Set(dbAuctions.map((a) => a?.owner_id).filter(Boolean)));
    const ownersById = new Map<string, any>();
    if (ownerIds.length) {
      const ownersUrl = new URL(`${this.supabaseUrl}/rest/v1/users`);
      ownersUrl.searchParams.set('select', 'id,email,name,phone');
      ownersUrl.searchParams.set('id', `in.(${ownerIds.join(',')})`);
      const owners = await this.supabaseJson<any[]>(ownersUrl.toString(), { method: 'GET' }) || [];
      for (const u of owners) ownersById.set(String(u.id), u);
    }

    return dbAuctions.map((a) => mapDbAuctionToApiAuction(a, ownersById.get(String(a?.owner_id)) || null));
  }

  async findById(id: string): Promise<Auction | null> {
    if (!this.supabaseUrl || !this.serviceKey) return null;

    const auctionUrl = new URL(`${this.supabaseUrl}/rest/v1/auctions`);
    const fields = [
      'id', 'title', 'description', 'owner_id', 'starting_price', 'current_price',
      'buy_now_price', 'reserve_price', 'reserve_met', 'ends_at', 'status',
      'category', 'pigeon', 'age', 'sex', 'location', 'images', 'videos', 'documents',
      'snipe_threshold_minutes', 'snipe_extension_minutes', 'min_bid_increment',
      'created_at', 'updated_at'
    ];
    auctionUrl.searchParams.set('select', fields.join(','));
    auctionUrl.searchParams.set('id', `eq.${encodeURIComponent(id)}`);
    auctionUrl.searchParams.set('limit', '1');

    const dbAuctionRows = await this.supabaseJson<any[]>(auctionUrl.toString(), { method: 'GET' });
    const dbAuction = dbAuctionRows?.[0];
    if (!dbAuction) return null;

    const ownerId = String(dbAuction.owner_id || '');
    const ownerRows = ownerId
      ? await this.supabaseJson<any[]>(
          `${this.supabaseUrl}/rest/v1/users?id=eq.${encodeURIComponent(ownerId)}&select=id,email,name,phone`,
          { method: 'GET' }
        ) || []
      : [];

    const apiAuction = mapDbAuctionToApiAuction(dbAuction, ownerRows?.[0] || null);

    // Fetch bids
    const bidsUrl = new URL(`${this.supabaseUrl}/rest/v1/bids`);
    bidsUrl.searchParams.set('select', 'id,amount,bidder_id,display_name,created_at');
    bidsUrl.searchParams.set('auction_id', `eq.${encodeURIComponent(apiAuction.id)}`);
    bidsUrl.searchParams.set('order', 'created_at.desc');
    bidsUrl.searchParams.set('limit', '50');
    const dbBids = await this.supabaseJson<any[]>(bidsUrl.toString(), { method: 'GET' }) || [];

    const bidderIds = Array.from(new Set(dbBids.map((b) => b?.bidder_id).filter(Boolean)));
    const biddersById = new Map<string, any>();
    if (bidderIds.length) {
      const biddersUrl = new URL(`${this.supabaseUrl}/rest/v1/users`);
      biddersUrl.searchParams.set('select', 'id,email,name');
      biddersUrl.searchParams.set('id', `in.(${bidderIds.join(',')})`);
      const bidders = await this.supabaseJson<any[]>(biddersUrl.toString(), { method: 'GET' }) || [];
      for (const u of bidders) biddersById.set(String(u.id), u);
    }

    apiAuction.bids = dbBids.map((b) => {
      const displayName = b?.display_name != null ? String(b.display_name).trim() : '';
      const bidderUser = biddersById.get(String(b?.bidder_id)) || null;
      const seller = mapUserToSeller(bidderUser, { id: String(b?.bidder_id || ''), email: bidderUser?.email });
      if (displayName) {
        return {
          id: String(b?.id),
          amount: Number(b?.amount ?? 0),
          bidder: { id: seller.id, firstName: displayName, lastName: '', displayName },
          createdAt: String(b?.created_at || new Date().toISOString()),
        };
      }
      return {
        id: String(b?.id),
        amount: Number(b?.amount ?? 0),
        bidder: { id: seller.id, firstName: seller.firstName, lastName: seller.lastName },
        createdAt: String(b?.created_at || new Date().toISOString()),
      };
    });

    // Counts
    // Ideally use separate query or count
    // Skipping for brevity as counts are handled by client usually or summary query
    return apiAuction;
  }
}
