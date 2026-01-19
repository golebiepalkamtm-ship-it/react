import { PrismaClient, AuctionStatus, PaymentStatus, PaymentType } from '../test_client/index.js';
import { processStripeEvent } from '../routes/payments.js';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function runTest() {
  console.log('🚀 Starting Payment Flow Integration Test');
  console.log('-------------------------------------------');

  let userId: string | null = null;
  let auctionId: string | null = null;
  let paymentId: string | null = null;

  try {
    // 1. Setup Test Data
    console.log('\n[1] Creating Test Data...');
    
    // Create User
    const userEmail = `test-payment-${Date.now()}@example.com`;
    const user = await prisma.user.create({
      data: {
        id: uuidv4(),
        email: userEmail,
        username: `testuser${Date.now()}`,
        role: 'USER_FULL_VERIFIED'
      }
    });
    userId = user.id;
    console.log(`✅ Created User: ${userId} (${userEmail})`);

    // Create Auction
    const auction = await prisma.auction.create({
      data: {
        id: uuidv4(),
        title: 'Integration Test Auction',
        description: 'Testing payment flow',
        sellerId: userId,
        startingPrice: 100,
        currentPrice: 100,
        buyNowPrice: 500,
        status: AuctionStatus.ACTIVE,
        endTime: new Date(Date.now() + 1000000),
        category: 'RACING',
        sex: 'MALE'
      }
    });
    auctionId = auction.id;
    console.log(`✅ Created Auction: ${auctionId}`);

    // Create Payment (Simulating user clicking "Buy Now")
    const payment = await prisma.payment.create({
      data: {
        id: uuidv4(),
        auctionId: auctionId,
        userId: userId,
        amount: 500,
        provider: 'STRIPE',
        type: PaymentType.BUY_NOW,
        status: PaymentStatus.INITIATED
      }
    });
    paymentId = payment.id;
    console.log(`✅ Created Payment: ${paymentId} (Status: INITIATED)`);


    // 2. Simulate Stripe Webhook: checkout.session.completed
    console.log('\n[2] Simulating Webhook: checkout.session.completed...');
    
    // Mock Event Payload
    const mockEvent: any = {
      id: `evt_${Date.now()}`,
      object: 'event',
      type: 'checkout.session.completed',
      created: Math.floor(Date.now() / 1000),
      data: {
        object: {
          id: `cs_test_${Date.now()}`,
          object: 'checkout.session',
          amount_total: 50000, // 500.00 PLN
          currency: 'pln',
          payment_status: 'paid',
          status: 'complete',
          payment_intent: `pi_test_${Date.now()}`,
          metadata: {
            paymentId: paymentId,
            auctionId: auctionId,
            buyerId: userId,
            paymentType: 'BUY_NOW'
          }
        }
      }
    };

    // Call the processing logic directly (bypassing signature check for test)
    await processStripeEvent(mockEvent, prisma);
    console.log('✅ Webhook processed successfully');


    // 3. Verify Final State
    console.log('\n[3] Verifying Database State...');

    const updatedPayment = await prisma.payment.findUnique({ where: { id: paymentId! } });
    const updatedAuction = await prisma.auction.findUnique({ where: { id: auctionId! } });

    console.log(`   Payment Status: ${updatedPayment?.status}`);
    console.log(`   Auction Status: ${updatedAuction?.status}`);
    console.log(`   Auction Winner: ${updatedAuction?.winnerId}`);

    let passed = true;

    if (updatedPayment?.status !== PaymentStatus.SUCCEEDED) {
      console.error('❌ FAIL: Payment status should be SUCCEEDED');
      passed = false;
    } else {
      console.log('✅ PASS: Payment status is SUCCEEDED');
    }

    if (updatedAuction?.status !== AuctionStatus.ENDED) {
      console.error('❌ FAIL: Auction status should be ENDED');
      passed = false;
    } else {
      console.log('✅ PASS: Auction status is ENDED');
    }

    if (updatedAuction?.winnerId !== userId) {
      console.error('❌ FAIL: Auction winner incorrect');
      passed = false;
    } else {
      console.log('✅ PASS: Auction winner is correct');
    }

    if (passed) {
      console.log('\n🎉 INTEGRATION TEST PASSED!');
    } else {
      console.log('\n💥 INTEGRATION TEST FAILED!');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n💥 TEST ERROR:', error);
    process.exit(1);
  } finally {
    // Cleanup
    if (userId) {
      console.log('\nCleaning up test data...');
      // Cascade delete should handle auction/payment if configured, but let's be safe
      // Prisma relations with onDelete: Cascade handle it usually.
      // User has relations, so deleting user might fail if not cascaded properly or succeed and wipe everything.
      // Given schema: user -> auctions (SellerAuctions), user -> payments.
      // Auction onDelete Cascade usually on User? 
      // Schema: `seller User? @relation(fields: [sellerId], references: [id])` - no onDelete Cascade specified, default restrict?
      // Wait, schema says: `user User @relation(fields: [userId], references: [id], onDelete: Cascade)` for SavedSearch.
      // For Auction: `seller User? ...`. Usually need to delete auction first.
      
      try {
        if (paymentId) await prisma.payment.delete({ where: { id: paymentId } });
        if (auctionId) await prisma.auction.delete({ where: { id: auctionId } });
        if (userId) await prisma.user.delete({ where: { id: userId } });
        console.log('✅ Cleanup complete');
      } catch (cleanupErr) {
        console.warn('⚠️ Cleanup failed (manual check required):', cleanupErr);
      }
    }
    await prisma.$disconnect();
  }
}

runTest();
