const { send } = require("micro");
const { router, get, post } = require("microrouter");
const morgan = require("micro-morgan");
const Redis = require("ioredis");

const UPVOTES = "werateelon__upvotes";
const TOTAL = "werateelon__total";

const client = new Redis(
  `redis://:${process.env.REDIS_PASS}@${process.env.REDIS_HOST}/0`
);

const rateLimitKey = req => {
  return `werateelon__ratekey__${req.headers["x-forwarded-for"] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress}`;
};

const handlers = {
  total: async (req, resp) => {
    const [upvotes, total] = await Promise.all([
      client.get(UPVOTES),
      client.get(TOTAL)
    ]);

    send(resp, 200, { upvotes, total });
  },
  upvote: async (req, resp) => {
    await Promise.all([client.incr(UPVOTES), client.incr(TOTAL)]);
    send(resp, 200, "OK");
  },
  downvote: async (req, resp) => {
    await client.incr(TOTAL);
    send(resp, 200, "OK");
  },
  notfound: (req, res) => send(res, 404, "Not Found")
};

const log = handler => morgan("tiny")(handler);

const rateLimit = handler => {
  return async (req, resp) => {
    const key = rateLimitKey(req);
    const cache = await client.get(key);
    if (cache) {
      return send(resp, 429, "Rate Limit Exceeded");
    }
    client.setex(key, process.env.RATE_LIMIT || 10, true);
    return handler(req, resp);
  };
};

module.exports = log(
  router(
    get("/api/elon", handlers.total),
    post("/api/elon/good", rateLimit(handlers.upvote)),
    post("/api/elon/bad", rateLimit(handlers.downvote)),
    handlers.notfound
  )
);
