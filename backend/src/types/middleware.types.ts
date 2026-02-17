/**
 * Store для зберігання інформації про rate limiting
 */
export interface RateLimitStore {
  [key: string]: {
    requests: number;
    resetTime: number;
  };
}