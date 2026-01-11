import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

let ratelimit: Ratelimit | null = null;

if (redisUrl && redisToken) {
    try {
        const redis = new Redis({
            url: redisUrl,
            token: redisToken,
        });

        // 20 requests per 10 seconds
        ratelimit = new Ratelimit({
            redis: redis,
            limiter: Ratelimit.slidingWindow(20, "10 s"),
            analytics: true,
            prefix: "@upstash/ratelimit",
        });
    } catch (error) {
        console.warn("Rate Limiting disabled: Failed to initialize Redis.");
    }
} else {
    console.warn("Rate Limiting disabled: UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN missing.");
}

export { ratelimit };
