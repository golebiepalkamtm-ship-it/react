import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { randomUUID } from 'crypto';
import { authMiddleware } from './middleware/auth.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '..', 'public')));

const uuidv4 = () => randomUUID();

const getNamePartsFromToken = (decodedToken) => {
  const raw = (decodedToken?.name || decodedToken?.email || '').trim();
  if (!raw) return { firstName: 'Użytkownik', lastName: '' };
  const parts = raw.split(/\s+/).filter(Boolean);
  const firstName = parts[0] || 'Użytkownik';
  const lastName = parts.slice(1).join(' ');
  return { firstName, lastName };
};

// Helper function to read auctions data
const readAuctionsData = () => {
  const dataPath = path.join(__dirname, 'data', 'auctions.json');
  const data = fs.readFileSync(dataPath, 'utf-8');
  return JSON.parse(data);
};

// Helper function to read meetings data - dynamically scans folders
const readMeetingsData = () => {
  const meetingsDir = path.join(__dirname, '..', 'public', 'meetings-with-breeders');
  if (!fs.existsSync(meetingsDir)) return { meetings: [] };
  
  const meetings = [];
  const dirs = fs.readdirSync(meetingsDir, { withFileTypes: true });
  
  let id = 1;
  for (const dir of dirs) {
    if (dir.isDirectory()) {
      const images = fs.readdirSync(path.join(meetingsDir, dir.name))
        .filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f))
        .map(f => `/meetings-with-breeders/${dir.name}/${f}`);
      
      if (images.length > 0) {
        meetings.push({
          id: String(id++),
          name: dir.name,
          location: '',
          date: '',
          description: `Spotkanie z ${dir.name}`,
          images: images,
        });
      }
    }
  }
  
  return { meetings };
};

// Helper function to read champions data from server/data/champions.json
const readChampionsData = () => {
  const dataPath = path.join(__dirname, 'data', 'champions.json');
  if (!fs.existsSync(dataPath)) return [];
  
  try {
    const data = fs.readFileSync(dataPath, 'utf-8');
    // Remove BOM if present
    const cleanData = data.replace(/^\uFEFF/, '');
    return JSON.parse(cleanData);
  } catch (err) {
    console.error('Error reading champions data:', err);
    return [];
  }
};

const isImageFile = (filename) => /\.(jpg|jpeg|png|gif|webp)$/i.test(filename);

const encodeUrlPath = (rawPath) => {
  // encode each segment but preserve '/'
  return rawPath
    .split('/')
    .map((segment) => (segment.length ? encodeURIComponent(segment) : segment))
    .join('/');
};

const safeReadDirFiles = (dirPath) => {
  try {
    if (!fs.existsSync(dirPath)) return [];
    return fs
      .readdirSync(dirPath)
      .filter((f) => isImageFile(f));
  } catch {
    return [];
  }
};

const enrichChampionWithImages = (champion) => {
  const championsRoot = path.join(__dirname, '..', 'public', 'champions');
  const id = String(champion.id);
  const galleryDir = path.join(championsRoot, id, 'gallery');
  const pedigreeDir = path.join(championsRoot, id, 'pedigree');

  const galleryFiles = safeReadDirFiles(galleryDir);
  const pedigreeFiles = safeReadDirFiles(pedigreeDir);

  const gallery = galleryFiles.map((f) => encodeUrlPath(`/champions/${id}/gallery/${f}`));
  const pedigree = pedigreeFiles.map((f) => encodeUrlPath(`/champions/${id}/pedigree/${f}`));

  // prefer explicit champion.image, otherwise first gallery image
  const image = champion.image ? encodeUrlPath(champion.image) : (gallery[0] || '/placeholder.svg');

  return {
    ...champion,
    image,
    images: gallery,
    pedigreeImages: pedigree,
  };
};

// Helper function to read references data
const readReferencesData = () => {
  const dataPath = path.join(__dirname, 'data', 'references.json');
  if (!fs.existsSync(dataPath)) return [];
  const data = fs.readFileSync(dataPath, 'utf-8');
  return JSON.parse(data);
};

// Helper function to write references data
const writeReferencesData = (data) => {
  const dataPath = path.join(__dirname, 'data', 'references.json');
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
};

// Helper function to write auctions data
const writeAuctionsData = (data) => {
  const dataPath = path.join(__dirname, 'data', 'auctions.json');
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
};

// GET /api/breeder-meetings - Get all breeder meetings
app.get('/api/breeder-meetings', (req, res) => {
  try {
    const data = readMeetingsData();
    res.json(data.meetings);
  } catch (error) {
    console.error('Error fetching meetings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/champions - Get all champions
app.get('/api/champions', (req, res) => {
  try {
    const data = readChampionsData().map(enrichChampionWithImages);
    res.json(data);
  } catch (error) {
    console.error('Error fetching champions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/references - Get all references
app.get('/api/references', (req, res) => {
  try {
    const data = readReferencesData();
    res.json(data);
  } catch (error) {
    console.error('Error fetching references:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/references - Add a new reference
app.post('/api/references', (req, res) => {
  try {
    const newReference = {
      id: uuidv4(),
      ...req.body,
      createdAt: new Date().toISOString()
    };
    
    const references = readReferencesData();
    references.unshift(newReference);
    writeReferencesData(references);
    
    res.status(201).json(newReference);
  } catch (error) {
    console.error('Error adding reference:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/auctions - Get all auctions with filtering
app.get('/api/auctions', (req, res) => {
  try {
    const { limit, status, sortBy } = req.query;
    const data = readAuctionsData();
    let auctions = data.auctions;

    // Filter by status
    if (status) {
      auctions = auctions.filter(a => a.status.toUpperCase() === status.toString().toUpperCase());
    }

    // Sort
    if (sortBy === 'newest') {
      auctions = auctions.sort((a, b) => new Date(b.endTime).getTime() - new Date(a.endTime).getTime());
    } else if (sortBy === 'price-high') {
      auctions = auctions.sort((a, b) => b.currentPrice - a.currentPrice);
    } else if (sortBy === 'price-low') {
      auctions = auctions.sort((a, b) => a.currentPrice - b.currentPrice);
    }

    // Limit results
    if (limit) {
      auctions = auctions.slice(0, parseInt(limit.toString()));
    }

    res.json({ auctions });
  } catch (error) {
    console.error('Error fetching auctions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/contact - Handle contact form submissions
app.post('/api/contact', (req, res) => {
  try {
    const { fullName, email, subject, message } = req.body;
    
    console.log('New contact form submission:');
    console.log(`From: ${fullName} (${email})`);
    console.log(`Subject: ${subject}`);
    console.log(`Message: ${message}`);

    // In a real app, you would send an email here
    
    res.status(200).json({ message: 'Message received successfully' });
  } catch (error) {
    console.error('Error processing contact form:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/auctions/:id - Get single auction
app.get('/api/auctions/:id', (req, res) => {
  try {
    const { id } = req.params;
    const data = readAuctionsData();
    const auction = data.auctions.find(a => a.id === id);

    if (!auction) {
      return res.status(404).json({ error: 'Auction not found' });
    }

    // Check if auction is still active
    const now = new Date();
    const endTime = new Date(auction.endTime);
    if (endTime < now && auction.status === 'active') {
      auction.status = 'ended';
      writeAuctionsData(data);
    }

    res.json(auction);
  } catch (error) {
    console.error('Error fetching auction:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auctions/:id/bids - Place a bid
app.post('/api/auctions/:id/bids', authMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const { amount, maxBid } = req.body;

    // Auth handled by middleware

    const data = readAuctionsData();
    const auctionIndex = data.auctions.findIndex(a => a.id === id);

    if (auctionIndex === -1) {
      return res.status(404).json({ error: 'Auction not found' });
    }

    const auction = data.auctions[auctionIndex];

    // Check if auction is still active
    const now = new Date();
    const endTime = new Date(auction.endTime);
    if (endTime < now) {
      return res.status(400).json({ error: 'Auction has ended' });
    }

    // Validate bid amount
    if (amount <= auction.currentPrice) {
      return res.status(400).json({ 
        error: `Bid must be higher than current price ${auction.currentPrice}` 
      });
    }

    // Create new bid
    const decoded = req.user;
    const { firstName, lastName } = getNamePartsFromToken(decoded);

    const newBid = {
      id: uuidv4(),
      amount,
      bidder: {
        id: decoded?.uid || 'unknown',
        firstName,
        lastName,
      },
      createdAt: new Date().toISOString(),
    };

    // Add bid to auction
    auction.bids.unshift(newBid);
    auction.currentPrice = amount;
    auction._count.bids = auction.bids.length;

    // Check for snipe protection
    let wasExtended = false;
    const timeLeft = endTime.getTime() - now.getTime();
    const snipeThreshold = (auction.snipeThresholdMinutes || 5) * 60 * 1000;

    if (timeLeft <= snipeThreshold) {
      // Extend auction
      const extensionMinutes = auction.snipeExtensionMinutes || 5;
      const newEndTime = new Date(endTime.getTime() + extensionMinutes * 60 * 1000);
      auction.endTime = newEndTime.toISOString();
      wasExtended = true;
    }

    // Save updated data
    writeAuctionsData(data);

    const meta = {
      wasExtended,
      newEndTime: wasExtended ? auction.endTime : null,
      autoBidTriggered: false
    };

    res.json({
      success: true,
      bid: newBid,
      meta,
    });
  } catch (error) {
    console.error('Error placing bid:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auctions - Create new auction
app.post('/api/auctions', authMiddleware, (req, res) => {
  try {
    const auctionData = req.body;
    const data = readAuctionsData();

    const decoded = req.user;
    const { firstName, lastName } = getNamePartsFromToken(decoded);

    const newAuction = {
      id: uuidv4(),
      ...auctionData,
      // Ensure we have a real seller identity when using Firebase auth
      seller: auctionData.seller || {
        id: decoded?.uid || 'unknown',
        firstName,
        lastName,
        email: decoded?.email || '',
        phoneNumber: '',
        image: null,
        rating: 0,
        salesCount: 0,
      },
      currentPrice: auctionData.startingPrice,
      status: 'active',
      bids: [],
      _count: {
        watchlist: 0,
        bids: 0
      }
    };

    data.auctions.push(newAuction);
    writeAuctionsData(data);

    res.status(201).json(newAuction);
  } catch (error) {
    console.error('Error creating auction:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 API Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🏆 Auctions API: http://localhost:${PORT}/api/auctions`);
});
