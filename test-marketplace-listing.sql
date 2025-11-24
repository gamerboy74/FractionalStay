-- Test Marketplace Listing
-- Run this in Supabase SQL Editor to create a test listing

-- Insert a test listing (update with your actual data)
INSERT INTO marketplace_listings (
    listing_id,
    seller_wallet,
    token_id,
    property_name,
    shares_amount,
    price_per_share,
    total_price,
    status,
    created_at
) VALUES (
    1, -- listing_id
    '0xYourWalletAddress', -- Replace with actual wallet
    1763840475319, -- Your actual property token_id
    'Luxury Villa in Goa', -- Property name
    10, -- Number of shares
    15000, -- Price per share (₹15,000)
    150000, -- Total price (10 * 15000)
    'ACTIVE',
    NOW()
);

-- Check if it was inserted
SELECT * FROM marketplace_listings;
