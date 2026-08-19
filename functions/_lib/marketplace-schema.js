async function columnNames(db, table) {
  const result = await db.prepare(`PRAGMA table_info(${table})`).all();
  return new Set((result.results || []).map((column) => column.name));
}

async function addMissingColumns(db, table, definitions) {
  const existing = await columnNames(db, table);
  for (const [name, definition] of definitions) {
    if (existing.has(name)) continue;
    try {
      await db.exec(`ALTER TABLE ${table} ADD COLUMN ${name} ${definition}`);
    } catch (error) {
      // Concurrent first loads may race to add the same column. Re-read the
      // schema and ignore only that benign case.
      const refreshed = await columnNames(db, table);
      if (!refreshed.has(name)) throw error;
    }
  }
}

async function runSchemaStep(label, statement) {
  try {
    await statement.run();
  } catch (error) {
    throw new Error(`${label}: ${String(error.message || error)}`);
  }
}

export async function ensureRealMarketplaceSchema(db) {
  await addMissingColumns(db, "ebay_opportunities", [
    ["data_source", "TEXT NOT NULL DEFAULT 'manual'"],
    ["source_reference", "TEXT"],
    ["verified_at", "INTEGER"],
    ["source_url", "TEXT"],
    ["description", "TEXT"],
    ["image_urls", "TEXT"],
    ["condition_code", "TEXT NOT NULL DEFAULT 'NEW'"],
    ["condition_description", "TEXT"],
  ]);
  await addMissingColumns(db, "ebay_orders", [
    ["data_source", "TEXT NOT NULL DEFAULT 'ebay_fulfillment_api'"],
    ["financial_status", "TEXT NOT NULL DEFAULT 'pending' CHECK (financial_status IN ('pending', 'reconciled'))"],
    ["ebay_earnings_cents", "INTEGER"],
    ["refund_cents", "INTEGER NOT NULL DEFAULT 0"],
    ["payout_id", "TEXT"],
    ["last_synced_at", "INTEGER"],
    ["costs_confirmed_at", "INTEGER"],
  ]);

  // Keep FK-sensitive cleanup sequential. D1 batches are transactional, but
  // production can validate constraints before all dependent deletes settle.
  await runSchemaStep("remove demo orders", db.prepare("DELETE FROM ebay_orders WHERE id IN ('order-demo-01', 'order-demo-02', 'order-demo-03') OR listing_id IN (SELECT id FROM ebay_listings WHERE opportunity_id IN ('opp-heatpad', 'opp-dock', 'opp-lamp', 'opp-organiser', 'opp-stand'))"));
  await runSchemaStep("remove demo listings", db.prepare("DELETE FROM ebay_listings WHERE id IN ('listing-organiser', 'listing-stand') OR opportunity_id IN ('opp-heatpad', 'opp-dock', 'opp-lamp', 'opp-organiser', 'opp-stand')"));
  await runSchemaStep("remove demo opportunities", db.prepare("DELETE FROM ebay_opportunities WHERE id IN ('opp-heatpad', 'opp-dock', 'opp-lamp', 'opp-organiser', 'opp-stand')"));
  await runSchemaStep("remove demo activity", db.prepare("DELETE FROM ebay_activity_log WHERE entity_id IN ('order-demo-01', 'order-demo-02', 'order-demo-03', 'listing-organiser', 'listing-stand', 'opp-heatpad', 'opp-dock', 'opp-lamp', 'opp-organiser', 'opp-stand', 'provider-manual-demo')"));
  await runSchemaStep("remove demo provider", db.prepare("DELETE FROM ebay_providers WHERE id = 'provider-manual-demo'"));
  await db.prepare("UPDATE ebay_providers SET notes = ? WHERE id = 'provider-bigbuy-demo'").bind("BigBuy free-account mode: real product data is entered manually; API access and supplier ordering remain disabled.").run();
  await db.prepare("UPDATE ebay_opportunities SET data_source = 'bigbuy_manual', source_reference = 'BigBuy SKU ' || supplier_sku, verified_at = updated_at WHERE id LIKE 'bigbuy-manual-%' AND (verified_at IS NULL OR data_source = 'manual')").run();

  await db.exec("CREATE INDEX IF NOT EXISTS ebay_orders_financial_status_idx ON ebay_orders(financial_status, costs_confirmed_at, ordered_at DESC)");
  await db.exec("CREATE TABLE IF NOT EXISTS ebay_financial_transactions (id TEXT PRIMARY KEY, order_id TEXT, transaction_type TEXT NOT NULL, transaction_status TEXT, booking_entry TEXT, amount_cents INTEGER NOT NULL, fee_cents INTEGER NOT NULL DEFAULT 0, payout_id TEXT, currency TEXT NOT NULL DEFAULT 'EUR', transaction_at INTEGER, synced_at INTEGER NOT NULL)");
  await db.exec("CREATE INDEX IF NOT EXISTS ebay_financial_transactions_order_idx ON ebay_financial_transactions(order_id, transaction_at DESC)");
  await db.exec("CREATE INDEX IF NOT EXISTS ebay_financial_transactions_payout_idx ON ebay_financial_transactions(payout_id, transaction_at DESC)");
  await db.exec("CREATE TABLE IF NOT EXISTS ebay_payouts (id TEXT PRIMARY KEY, payout_status TEXT NOT NULL, amount_cents INTEGER NOT NULL, currency TEXT NOT NULL DEFAULT 'EUR', scheduled_at INTEGER, sent_at INTEGER, bank_reference TEXT, synced_at INTEGER NOT NULL)");
  await db.exec("CREATE TABLE IF NOT EXISTS marketplace_app_credentials (service TEXT PRIMARY KEY, client_id TEXT NOT NULL, client_secret_cipher TEXT NOT NULL, client_secret_iv TEXT NOT NULL, redirect_uri_name TEXT NOT NULL, environment TEXT NOT NULL DEFAULT 'production', updated_at INTEGER NOT NULL, updated_by TEXT NOT NULL)");
  await db.exec("CREATE TABLE IF NOT EXISTS ebay_account_deletion_events (id TEXT PRIMARY KEY, payload_hash TEXT NOT NULL, received_at INTEGER NOT NULL, processing_status TEXT NOT NULL CHECK (processing_status IN ('acknowledged', 'processed', 'failed')))");
}
