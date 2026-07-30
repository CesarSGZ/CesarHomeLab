const PORTFOLIO_SIGNATURE = [80, 80, 80, 66, 86, 49]; // PPPBV1
const MONEY_FACTOR = 100;
const SHARE_FACTOR = 100_000_000;
const QUOTE_FACTOR = 100_000_000;
const EPOCH_MS = Date.UTC(1970, 0, 1);

const TRANSACTION_TYPES = [
  "PURCHASE",
  "SALE",
  "INBOUND_DELIVERY",
  "OUTBOUND_DELIVERY",
  "SECURITY_TRANSFER",
  "CASH_TRANSFER",
  "DEPOSIT",
  "REMOVAL",
  "DIVIDEND",
  "INTEREST",
  "INTEREST_CHARGE",
  "TAX",
  "TAX_REFUND",
  "FEE",
  "FEE_REFUND",
];

const POSITION_COLORS = [
  "#52d9ff",
  "#c9ff3d",
  "#a98be0",
  "#ffb75e",
  "#ff7c8c",
  "#58e2b0",
  "#6d9dff",
  "#d2e4ea",
  "#d4a7ff",
  "#92c56e",
];

function readUint32(bytes, offset) {
  return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(
    offset,
    true,
  );
}

function readUint16(bytes, offset) {
  return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint16(
    offset,
    true,
  );
}

async function inflateRaw(bytes) {
  const stream = new Blob([bytes])
    .stream()
    .pipeThrough(new DecompressionStream("deflate-raw"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

async function readPortfolioEntry(archiveBytes) {
  let eocd = -1;
  const minimum = Math.max(0, archiveBytes.length - 65_557);
  for (let offset = archiveBytes.length - 22; offset >= minimum; offset -= 1) {
    if (readUint32(archiveBytes, offset) === 0x06054b50) {
      eocd = offset;
      break;
    }
  }
  if (eocd < 0) throw new Error("portfolio_archive_invalid");

  const entries = readUint16(archiveBytes, eocd + 10);
  let centralOffset = readUint32(archiveBytes, eocd + 16);

  for (let index = 0; index < entries; index += 1) {
    if (readUint32(archiveBytes, centralOffset) !== 0x02014b50) {
      throw new Error("portfolio_archive_invalid");
    }
    const method = readUint16(archiveBytes, centralOffset + 10);
    const compressedSize = readUint32(archiveBytes, centralOffset + 20);
    const filenameLength = readUint16(archiveBytes, centralOffset + 28);
    const extraLength = readUint16(archiveBytes, centralOffset + 30);
    const commentLength = readUint16(archiveBytes, centralOffset + 32);
    const localOffset = readUint32(archiveBytes, centralOffset + 42);
    const filename = new TextDecoder().decode(
      archiveBytes.subarray(
        centralOffset + 46,
        centralOffset + 46 + filenameLength,
      ),
    );

    if (filename === "data.portfolio") {
      if (readUint32(archiveBytes, localOffset) !== 0x04034b50) {
        throw new Error("portfolio_archive_invalid");
      }
      const localNameLength = readUint16(archiveBytes, localOffset + 26);
      const localExtraLength = readUint16(archiveBytes, localOffset + 28);
      const dataOffset = localOffset + 30 + localNameLength + localExtraLength;
      const compressed = archiveBytes.subarray(
        dataOffset,
        dataOffset + compressedSize,
      );
      if (method === 0) return compressed;
      if (method === 8) return inflateRaw(compressed);
      throw new Error("portfolio_compression_unsupported");
    }

    centralOffset += 46 + filenameLength + extraLength + commentLength;
  }

  throw new Error("portfolio_entry_missing");
}

class ProtobufReader {
  constructor(bytes) {
    this.bytes = bytes;
    this.position = 0;
  }

  get done() {
    return this.position >= this.bytes.length;
  }

  varintBig() {
    let value = 0n;
    let shift = 0n;
    while (!this.done && shift <= 70n) {
      const byte = this.bytes[this.position++];
      value |= BigInt(byte & 0x7f) << shift;
      if ((byte & 0x80) === 0) return value;
      shift += 7n;
    }
    throw new Error("portfolio_protobuf_invalid");
  }

  varint() {
    return Number(this.varintBig());
  }

  tag() {
    const tag = this.varint();
    return { field: tag >>> 3, wire: tag & 7 };
  }

  bytesValue() {
    const length = this.varint();
    const end = this.position + length;
    if (end > this.bytes.length) throw new Error("portfolio_protobuf_invalid");
    const value = this.bytes.subarray(this.position, end);
    this.position = end;
    return value;
  }

  string() {
    return new TextDecoder().decode(this.bytesValue());
  }

  message(parser) {
    return parser(new ProtobufReader(this.bytesValue()));
  }

  skip(wire) {
    if (wire === 0) this.varintBig();
    else if (wire === 1) this.position += 8;
    else if (wire === 2) {
      const length = this.varint();
      this.position += length;
    }
    else if (wire === 5) this.position += 4;
    else throw new Error("portfolio_protobuf_wire_unsupported");
    if (this.position > this.bytes.length) {
      throw new Error("portfolio_protobuf_invalid");
    }
  }
}

function parseTimestamp(reader) {
  let seconds = 0;
  while (!reader.done) {
    const { field, wire } = reader.tag();
    if (field === 1 && wire === 0) seconds = reader.varint();
    else reader.skip(wire);
  }
  return seconds * 1000;
}

function parsePrice(reader) {
  const price = { date: 0, close: 0 };
  while (!reader.done) {
    const { field, wire } = reader.tag();
    if (field === 1 && wire === 0) price.date = reader.varint();
    else if (field === 2 && wire === 0) price.close = reader.varint();
    else reader.skip(wire);
  }
  return price;
}

function rememberPrice(security, price) {
  if (!price.date || !price.close) return;
  const candidate = {
    date: EPOCH_MS + price.date * 86_400_000,
    price: price.close / QUOTE_FACTOR,
  };
  if (!security.storedQuote || candidate.date > security.storedQuote.date) {
    security.previousStoredQuote = security.storedQuote;
    security.storedQuote = candidate;
  } else if (
    (!security.previousStoredQuote ||
      candidate.date > security.previousStoredQuote.date) &&
    candidate.date < security.storedQuote.date
  ) {
    security.previousStoredQuote = candidate;
  }
}

function parseSecurity(reader) {
  const security = {
    uuid: "",
    name: "",
    currency: "",
    isin: "",
    ticker: "",
    wkn: "",
    retired: false,
    storedQuote: null,
    previousStoredQuote: null,
  };
  while (!reader.done) {
    const { field, wire } = reader.tag();
    if (field === 1 && wire === 2) security.uuid = reader.string();
    else if (field === 3 && wire === 2) security.name = reader.string();
    else if (field === 4 && wire === 2) security.currency = reader.string();
    else if (field === 7 && wire === 2) security.isin = reader.string();
    else if (field === 8 && wire === 2) security.ticker = reader.string();
    else if (field === 9 && wire === 2) security.wkn = reader.string();
    else if (field === 13 && wire === 2) {
      rememberPrice(security, reader.message(parsePrice));
    } else if (field === 16 && wire === 2) {
      rememberPrice(security, reader.message(parsePrice));
    } else if (field === 20 && wire === 0) security.retired = Boolean(reader.varint());
    else reader.skip(wire);
  }
  return security;
}

function parseAccount(reader) {
  const account = { uuid: "", name: "", currency: "", retired: false };
  while (!reader.done) {
    const { field, wire } = reader.tag();
    if (field === 1 && wire === 2) account.uuid = reader.string();
    else if (field === 2 && wire === 2) account.name = reader.string();
    else if (field === 3 && wire === 2) account.currency = reader.string();
    else if (field === 5 && wire === 0) account.retired = Boolean(reader.varint());
    else reader.skip(wire);
  }
  return account;
}

function parsePortfolio(reader) {
  const portfolio = { uuid: "", name: "", referenceAccount: "", retired: false };
  while (!reader.done) {
    const { field, wire } = reader.tag();
    if (field === 1 && wire === 2) portfolio.uuid = reader.string();
    else if (field === 2 && wire === 2) portfolio.name = reader.string();
    else if (field === 4 && wire === 0) portfolio.retired = Boolean(reader.varint());
    else if (field === 5 && wire === 2) portfolio.referenceAccount = reader.string();
    else reader.skip(wire);
  }
  return portfolio;
}

function parseTransaction(reader) {
  const transaction = {
    uuid: "",
    type: 0,
    account: "",
    portfolio: "",
    otherAccount: "",
    otherPortfolio: "",
    date: 0,
    currency: "",
    amount: 0,
    shares: null,
    note: "",
    security: "",
  };
  while (!reader.done) {
    const { field, wire } = reader.tag();
    if (field === 1 && wire === 2) transaction.uuid = reader.string();
    else if (field === 2 && wire === 0) transaction.type = reader.varint();
    else if (field === 3 && wire === 2) transaction.account = reader.string();
    else if (field === 4 && wire === 2) transaction.portfolio = reader.string();
    else if (field === 5 && wire === 2) transaction.otherAccount = reader.string();
    else if (field === 6 && wire === 2) transaction.otherPortfolio = reader.string();
    else if (field === 9 && wire === 2) transaction.date = reader.message(parseTimestamp);
    else if (field === 10 && wire === 2) transaction.currency = reader.string();
    else if (field === 11 && wire === 0) transaction.amount = reader.varint();
    else if (field === 12 && wire === 0) transaction.shares = reader.varint();
    else if (field === 13 && wire === 2) transaction.note = reader.string();
    else if (field === 14 && wire === 2) transaction.security = reader.string();
    else reader.skip(wire);
  }
  return transaction;
}

export async function parsePortfolioArchive(arrayBuffer) {
  const entry = await readPortfolioEntry(new Uint8Array(arrayBuffer));
  if (
    entry.length < PORTFOLIO_SIGNATURE.length ||
    PORTFOLIO_SIGNATURE.some((byte, index) => entry[index] !== byte)
  ) {
    throw new Error("portfolio_signature_invalid");
  }

  const reader = new ProtobufReader(entry.subarray(PORTFOLIO_SIGNATURE.length));
  const client = {
    version: 0,
    baseCurrency: "EUR",
    securities: [],
    accounts: [],
    portfolios: [],
    transactions: [],
  };
  while (!reader.done) {
    const { field, wire } = reader.tag();
    if (field === 1 && wire === 0) client.version = reader.varint();
    else if (field === 2 && wire === 2) {
      client.securities.push(reader.message(parseSecurity));
    } else if (field === 3 && wire === 2) {
      client.accounts.push(reader.message(parseAccount));
    } else if (field === 4 && wire === 2) {
      client.portfolios.push(reader.message(parsePortfolio));
    } else if (field === 5 && wire === 2) {
      client.transactions.push(reader.message(parseTransaction));
    } else if (field === 12 && wire === 2) client.baseCurrency = reader.string();
    else reader.skip(wire);
  }
  return client;
}

async function fetchDriveArchive(fileId, forceRefresh) {
  if (!fileId) throw new Error("portfolio_source_not_configured");
  const url = new URL("https://drive.usercontent.google.com/download");
  url.searchParams.set("id", fileId);
  url.searchParams.set("export", "download");
  url.searchParams.set("confirm", "t");
  if (forceRefresh) url.searchParams.set("_refresh", String(Date.now()));
  const response = await fetch(url, {
    headers: { accept: "application/octet-stream" },
    cf: forceRefresh
      ? { cacheTtl: 0 }
      : { cacheEverything: true, cacheTtl: 300 },
  });
  if (!response.ok) throw new Error("portfolio_source_unavailable");
  return {
    bytes: await response.arrayBuffer(),
    etag: response.headers.get("etag") || "",
    modified: response.headers.get("last-modified") || "",
  };
}

function normaliseYahooSymbol(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, "-");
}

async function fetchYahooQuote(security, forceRefresh) {
  const symbol = normaliseYahooSymbol(security.ticker);
  if (!symbol) return null;
  const url = new URL(
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}`,
  );
  url.searchParams.set("range", "5d");
  url.searchParams.set("interval", "1d");
  if (forceRefresh) url.searchParams.set("_refresh", String(Date.now()));
  try {
    const response = await fetch(url, {
      headers: {
        accept: "application/json",
        "user-agent": "Mozilla/5.0",
      },
      cf: forceRefresh
        ? { cacheTtl: 0 }
        : { cacheEverything: true, cacheTtl: 900 },
    });
    if (!response.ok) return null;
    const payload = await response.json();
    const result = payload?.chart?.result?.[0];
    const meta = result?.meta;
    const price = Number(meta?.regularMarketPrice);
    if (!Number.isFinite(price) || price <= 0) return null;
    const closes = (result?.indicators?.quote?.[0]?.close || []).filter(
      (value) => Number.isFinite(value) && value > 0,
    );
    const previous = Number(
      meta?.regularMarketPreviousClose ||
        meta?.chartPreviousClose ||
        closes.at(-2) ||
        closes.at(-1),
    );
    return {
      price,
      previous: Number.isFinite(previous) && previous > 0 ? previous : price,
      currency: meta?.currency || security.currency,
      timestamp: Number(meta?.regularMarketTime || 0) * 1000 || Date.now(),
      source: "live",
      symbol: meta?.symbol || symbol,
    };
  } catch {
    return null;
  }
}

async function fetchExchangeRates(baseCurrency, currencies, forceRefresh) {
  const unique = [...new Set(currencies.filter((currency) => currency && currency !== baseCurrency))];
  const rates = { [baseCurrency]: 1 };
  if (!unique.length) return { rates, date: null };

  const url = new URL("https://api.frankfurter.dev/v2/rates");
  url.searchParams.set("base", baseCurrency);
  url.searchParams.set("quotes", unique.join(","));
  if (forceRefresh) url.searchParams.set("_refresh", String(Date.now()));
  try {
    const response = await fetch(url, {
      headers: { accept: "application/json" },
      cf: forceRefresh
        ? { cacheTtl: 0 }
        : { cacheEverything: true, cacheTtl: 21_600 },
    });
    if (!response.ok) throw new Error("fx_unavailable");
    const payload = await response.json();
    let rateDate = null;
    for (const item of Array.isArray(payload) ? payload : []) {
      if (item?.quote && Number(item.rate) > 0) {
        rates[item.quote] = Number(item.rate);
        rateDate = item.date || rateDate;
      }
    }
    return { rates, date: rateDate };
  } catch {
    return { rates, date: null };
  }
}

function toBaseCurrency(amount, currency, baseCurrency, rates) {
  if (currency === baseCurrency) return amount;
  const rate = rates[currency];
  return Number.isFinite(rate) && rate > 0 ? amount / rate : null;
}

function positionCategory(security) {
  const value = `${security.name} ${security.ticker}`.toLowerCase();
  return /(^|\s)0p|fund|fondo|fonds|\bfi\b/.test(value) ? "Fund" : "Equity";
}

function round(value, decimals = 2) {
  if (!Number.isFinite(value)) return null;
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

function latestDate(values) {
  const timestamps = values.filter((value) => Number.isFinite(value) && value > 0);
  return timestamps.length ? Math.max(...timestamps) : null;
}

export async function buildPortfolioSummary(fileId, { forceRefresh = false } = {}) {
  const downloadedAt = Date.now();
  const archive = await fetchDriveArchive(fileId, forceRefresh);
  const client = await parsePortfolioArchive(archive.bytes);
  const securities = new Map(client.securities.map((security) => [security.uuid, security]));
  const sortedTransactions = [...client.transactions].sort((a, b) => a.date - b.date);

  const rawHoldings = new Map();
  for (const transaction of sortedTransactions) {
    if (!transaction.security || transaction.shares === null) continue;
    const holding = rawHoldings.get(transaction.security) || {
      shares: 0,
      cost: 0,
      purchases: 0,
    };
    const shares = transaction.shares / SHARE_FACTOR;
    const amount = transaction.amount / MONEY_FACTOR;
    if (transaction.type === 0 || transaction.type === 2) {
      holding.shares += shares;
      if (transaction.type === 0) {
        holding.cost += amount;
        holding.purchases += 1;
      }
    } else if (transaction.type === 1 || transaction.type === 3) {
      const existingShares = holding.shares;
      if (existingShares > 0) {
        const removedRatio = Math.min(1, shares / existingShares);
        holding.cost *= 1 - removedRatio;
      }
      holding.shares = Math.max(0, holding.shares - shares);
    }
    rawHoldings.set(transaction.security, holding);
  }

  const activeSecurityIds = [...rawHoldings.entries()]
    .filter(([, holding]) => holding.shares > 1 / SHARE_FACTOR)
    .map(([securityId]) => securityId);
  const activeSecurities = activeSecurityIds
    .map((securityId) => securities.get(securityId))
    .filter(Boolean);

  const [liveQuotes, fx] = await Promise.all([
    Promise.all(
      activeSecurities.map((security) => fetchYahooQuote(security, forceRefresh)),
    ),
    fetchExchangeRates(
      client.baseCurrency,
      activeSecurities.map((security) => security.currency),
      forceRefresh,
    ),
  ]);

  const quoteBySecurity = new Map();
  activeSecurities.forEach((security, index) => {
    const live = liveQuotes[index];
    quoteBySecurity.set(
      security.uuid,
      live || {
        price: security.storedQuote?.price || 0,
        previous:
          security.previousStoredQuote?.price ||
          security.storedQuote?.price ||
          0,
        currency: security.currency,
        timestamp: security.storedQuote?.date || 0,
        source: "portfolio-performance",
        symbol: normaliseYahooSymbol(security.ticker),
      },
    );
  });

  let cash = 0;
  let netContributions = 0;
  for (const transaction of sortedTransactions) {
    const amount = toBaseCurrency(
      transaction.amount / MONEY_FACTOR,
      transaction.currency || client.baseCurrency,
      client.baseCurrency,
      fx.rates,
    );
    if (amount === null) continue;
    if ([1, 6, 8, 9, 12, 14].includes(transaction.type)) cash += amount;
    else if ([0, 7, 10, 11, 13].includes(transaction.type)) cash -= amount;

    if (transaction.type === 6) netContributions += amount;
    else if (transaction.type === 7) netContributions -= amount;
  }

  let investedValue = 0;
  let dayChange = 0;
  let currentCost = 0;
  let missingFx = false;
  const positions = activeSecurities.map((security, index) => {
    const holding = rawHoldings.get(security.uuid);
    const quote = quoteBySecurity.get(security.uuid);
    const currency = quote.currency || security.currency || client.baseCurrency;
    const localValue = holding.shares * quote.price;
    const localPreviousValue = holding.shares * quote.previous;
    const value = toBaseCurrency(
      localValue,
      currency,
      client.baseCurrency,
      fx.rates,
    );
    const previousValue = toBaseCurrency(
      localPreviousValue,
      currency,
      client.baseCurrency,
      fx.rates,
    );
    if (value === null) missingFx = true;
    const safeValue = value || 0;
    investedValue += safeValue;
    dayChange += safeValue - (previousValue ?? safeValue);
    currentCost += holding.cost;
    return {
      id: security.uuid,
      name: security.name,
      symbol: quote.symbol || security.ticker || security.isin,
      isin: security.isin,
      category: positionCategory(security),
      currency,
      shares: round(holding.shares, 8),
      price: round(quote.price, 6),
      value: round(safeValue),
      cost: round(holding.cost),
      gain: round(safeValue - holding.cost),
      gainPercent:
        holding.cost > 0 ? round(((safeValue - holding.cost) / holding.cost) * 100) : null,
      dayChange: round(safeValue - (previousValue ?? safeValue)),
      quoteDate: quote.timestamp,
      quoteSource: quote.source,
      color: POSITION_COLORS[index % POSITION_COLORS.length],
      weight: 0,
    };
  });

  positions.sort((a, b) => b.value - a.value);
  positions.forEach((position) => {
    position.weight = investedValue > 0 ? round((position.value / investedValue) * 100, 1) : 0;
  });

  const totalValue = cash + investedValue;
  const dayBase = totalValue - dayChange;
  const unrealisedGain = investedValue - currentCost;
  const totalResult = totalValue - netContributions;
  const categories = [...positions.reduce((map, position) => {
    const current = map.get(position.category) || 0;
    map.set(position.category, current + position.value);
    return map;
  }, new Map())].map(([name, value], index) => ({
    name,
    value: round(value),
    weight: investedValue > 0 ? round((value / investedValue) * 100, 1) : 0,
    color: index === 0 ? "#52d9ff" : "#c9ff3d",
  }));

  const recentTransactions = [...sortedTransactions]
    .reverse()
    .slice(0, 8)
    .map((transaction) => {
      const security = securities.get(transaction.security);
      return {
        id: transaction.uuid,
        date: transaction.date,
        type: TRANSACTION_TYPES[transaction.type] || "OTHER",
        security: security?.name || (transaction.type === 6 ? "Cash contribution" : "Cash movement"),
        amount: round(transaction.amount / MONEY_FACTOR),
        currency: transaction.currency || client.baseCurrency,
        shares:
          transaction.shares === null
            ? null
            : round(transaction.shares / SHARE_FACTOR, 8),
      };
    });

  return {
    ok: true,
    currency: client.baseCurrency,
    summary: {
      totalValue: round(totalValue),
      investedValue: round(investedValue),
      cash: round(cash),
      currentCost: round(currentCost),
      unrealisedGain: round(unrealisedGain),
      unrealisedGainPercent:
        currentCost > 0 ? round((unrealisedGain / currentCost) * 100) : null,
      netContributions: round(netContributions),
      totalResult: round(totalResult),
      totalResultPercent:
        netContributions > 0 ? round((totalResult / netContributions) * 100) : null,
      dayChange: round(dayChange),
      dayChangePercent: dayBase > 0 ? round((dayChange / dayBase) * 100) : null,
      positionCount: positions.length,
    },
    positions,
    categories,
    recentTransactions,
    freshness: {
      downloadedAt,
      sourceModifiedAt: archive.modified ? Date.parse(archive.modified) || null : null,
      latestTransactionAt: latestDate(client.transactions.map((transaction) => transaction.date)),
      latestQuoteAt: latestDate(positions.map((position) => position.quoteDate)),
      liveQuotes: positions.filter((position) => position.quoteSource === "live").length,
      storedQuotes: positions.filter(
        (position) => position.quoteSource === "portfolio-performance",
      ).length,
      fxDate: fx.date,
      missingFx,
      source: "Google Drive · Portfolio Performance",
      fileVersion: client.version,
      etag: archive.etag,
    },
  };
}
