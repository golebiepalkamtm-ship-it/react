export enum AuctionErrorCodes {
  // Auction not found
  AUCTION_NOT_FOUND = 'AUCTION_NOT_FOUND',
  
  // Auction status errors
  AUCTION_NOT_ACTIVE = 'AUCTION_NOT_ACTIVE',
  AUCTION_ENDED = 'AUCTION_ENDED',
  AUCTION_CANCELLED = 'AUCTION_CANCELLED',
  
  // Bid validation errors
  INVALID_BID_AMOUNT = 'INVALID_BID_AMOUNT',
  BID_TOO_LOW = 'BID_TOO_LOW',
  BID_INCREMENT_TOO_SMALL = 'BID_INCREMENT_TOO_SMALL',
  
  // Permission errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  ACCOUNT_NOT_VERIFIED = 'ACCOUNT_NOT_VERIFIED',
  
  // Buy now errors
  BUY_NOW_NOT_AVAILABLE = 'BUY_NOW_NOT_AVAILABLE',
  BUY_NOW_PRICE_INVALID = 'BUY_NOW_PRICE_INVALID',
  
  // System errors
  DATABASE_ERROR = 'DATABASE_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  
  // Concurrency errors
  CONCURRENT_BID_CONFLICT = 'CONCURRENT_BID_CONFLICT',
  RACE_CONDITION_DETECTED = 'RACE_CONDITION_DETECTED',
}

export interface AuctionErrorPayload {
  code: AuctionErrorCodes;
  message: string;
  details?: any;
  timestamp: string;
}

export class AuctionError extends Error {
  public code: AuctionErrorCodes;
  public details?: any;
  public timestamp: string;

  constructor(code: AuctionErrorCodes, message: string, details?: any) {
    super(message);
    this.name = 'AuctionError';
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }

  toJSON(): AuctionErrorPayload {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
      timestamp: this.timestamp,
    };
  }
}

export const createAuctionError = (
  code: AuctionErrorCodes,
  message: string,
  details?: any
): AuctionError => {
  return new AuctionError(code, message, details);
};

export const handlePrismaError = (error: any): AuctionError => {
  // Handle common Prisma error codes
  switch (error.code) {
    case 'P2002':
      return createAuctionError(
        AuctionErrorCodes.CONCURRENT_BID_CONFLICT,
        'Concurrent bid detected. Please try again.',
        { constraint: error.meta?.target }
      );
    
    case 'P2025':
      return createAuctionError(
        AuctionErrorCodes.AUCTION_NOT_FOUND,
        'Auction not found.',
        { id: error.meta?.target }
      );
    
    case 'P2003':
      return createAuctionError(
        AuctionErrorCodes.FORBIDDEN,
        'Foreign key constraint violation.',
        { field: error.meta?.field_name }
      );
    
    default:
      return createAuctionError(
        AuctionErrorCodes.DATABASE_ERROR,
        'Database operation failed.',
        { originalError: error.message }
      );
  }
};

export const getErrorMessage = (error: { code: AuctionErrorCodes; message: string }): string => {
  const messages: Record<AuctionErrorCodes, string> = {
    [AuctionErrorCodes.AUCTION_NOT_FOUND]: 'Aukcja nie została znaleziona.',
    [AuctionErrorCodes.AUCTION_NOT_ACTIVE]: 'Aukcja nie jest aktywna.',
    [AuctionErrorCodes.AUCTION_ENDED]: 'Aukcja została zakończona.',
    [AuctionErrorCodes.AUCTION_CANCELLED]: 'Aukcja została anulowana.',
    [AuctionErrorCodes.INVALID_BID_AMOUNT]: 'Nieprawidłowa kwota oferty.',
    [AuctionErrorCodes.BID_TOO_LOW]: 'Oferta jest zbyt niska.',
    [AuctionErrorCodes.BID_INCREMENT_TOO_SMALL]: 'Minimalny przyrost oferty nie został spełniony.',
    [AuctionErrorCodes.UNAUTHORIZED]: 'Brak autoryzacji.',
    [AuctionErrorCodes.FORBIDDEN]: 'Brak dostępu.',
    [AuctionErrorCodes.ACCOUNT_NOT_VERIFIED]: 'Konto nie zostało zweryfikowane.',
    [AuctionErrorCodes.BUY_NOW_NOT_AVAILABLE]: 'Opcja Kup teraz nie jest dostępna.',
    [AuctionErrorCodes.BUY_NOW_PRICE_INVALID]: 'Nieprawidłowa cena Kup teraz.',
    [AuctionErrorCodes.DATABASE_ERROR]: 'Błąd bazy danych.',
    [AuctionErrorCodes.VALIDATION_ERROR]: 'Błąd walidacji danych.',
    [AuctionErrorCodes.INTERNAL_SERVER_ERROR]: 'Wewnętrzny błąd serwera.',
    [AuctionErrorCodes.CONCURRENT_BID_CONFLICT]: 'Wykryto konflikt równoczesnych ofert.',
    [AuctionErrorCodes.RACE_CONDITION_DETECTED]: 'Wykryto warunek wyścigu.',
  };

  return messages[error.code] || error.message;
};
