// Tracks the number of GPT API requests made.
// Maximum allowed: 250 (per assessment rules)

const MAX_REQUESTS = 250;
let requestCount = 0;

module.exports = {
  increment: () => {
    requestCount += 1;
    return requestCount;
  },
  getCount: () => requestCount,
  getMax: () => MAX_REQUESTS,
  isLimitReached: () => requestCount >= MAX_REQUESTS,
};