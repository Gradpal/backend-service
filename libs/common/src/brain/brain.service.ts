import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { ONE_MONTH } from '../constants/all.constants';
import { BrainConfigService } from './brain-config.service';
/**
 * This class here, plays the role of your brain.
 *
 * It memorizes and remembers
 */
@Injectable()
export class BrainService {
  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly configService: BrainConfigService,
  ) {}

  private formattedKey(keyString: string) {
    return `${this.configService.getAppPrefix()}:${keyString}`;
  }
  /**
   * To memorize, just give me the object of type T and i do the work for you bro
   * @param key of Type UUID
   * @param memorize<T>
   * @param ttl od Type number
   */
  async memorize<T>(key: string, memorize: T, ttl?: number): Promise<void> {
    const formattedKey = this.formattedKey(key);

    await this.redis.set(formattedKey, JSON.stringify(memorize));

    await this.redis.pexpire(formattedKey, ttl ? ttl : ONE_MONTH);
  }

  /**
   * Updates an existing Redis entry while preserving its TTL.
   * Does nothing if the key doesn't exist.
   *
   * @param key - Redis key to update
   * @param newValue - New value to store
   * @returns true if updated, false if key not found
   */
  async updateMemory<T>(key: string, newValue: T): Promise<boolean> {
    const formattedKey = this.formattedKey(key);
    const ttl = await this.redis.pttl(formattedKey);

    if (ttl > 0) {
      await this.redis.set(formattedKey, JSON.stringify(newValue), 'PX', ttl);
      return true;
    } else {
      return false;
    }
  }

  /**
   * This function will remember the value linked to a specific key eg: employerId
   * @param key of Type UUID
   */
  async remindMe<T>(key: string): Promise<T> {
    const formattedKey = this.formattedKey(key);

    const value = await this.redis.get(formattedKey);
    if (value) {
      return JSON.parse(value);
    }
    return null;
  }

  /**
   * Adds an element to a Redis Set with an expiration time
   * @template T Type parameter (currently unused but preserved for future use)
   * @param {string} setName - The name of the Redis Set
   * @param {string} payload - The element to add to the Set
   * @param {number} ttl - Time-to-live in milliseconds for the Set
   * @returns {Promise<void>}
   */
  async addToListOfUniqueElements<T>(
    setName: string,
    payload: string,
    ttl: number,
  ) {
    const formattedKey = this.formattedKey(setName);

    await this.redis.sadd(formattedKey, payload);

    await this.redis.pexpire(formattedKey, ttl);
  }

  /**
   * Checks if an element exists in a Redis Set
   * @template T Type parameter (currently unused but preserved for future use)
   * @param {string} setName - The name of the Redis Set to check
   * @param {string} payload - The element to check for existence
   * @returns {Promise<boolean>} Returns true if the element exists in the Set, false otherwise
   */
  async isElementInListOfUniqueElements<T>(
    setName: string,
    payload: string,
  ): Promise<boolean> {
    const formattedKey = this.formattedKey(setName);

    return (await this.redis.sismember(formattedKey, payload)) === 1;
  }

  /**
   * This function will forgot the value linked to a specific key eg: employer.matriculeNumber
   * @param key of Type UUID
   */
  async forget(key: string): Promise<any> {
    const formattedKey = this.formattedKey(key);

    return this.redis.del(formattedKey);
  }

  /**
   * Deletes multiple key-value pairs from Redis cache.
   *
   * @param keys - Array of cache keys to be deleted
   * @returns Promise that resolves when all deletions are complete
   *
   * @example
   * ```ts
   * await brainService.forgetMany(['key1', 'key2', 'key3']);
   * ```
   */
  async forgetMany(keys: string[]): Promise<void> {
    const formattedKeys = keys.map((key) => this.formattedKey(key));

    await Promise.all(
      formattedKeys.map((formattedKey) => this.redis.del(formattedKey)),
    );
  }

  /**
   * This will clean all the keys in Redis
   * @returns
   */
  async clearAllKeys(): Promise<void> {
    this.redis.flushall();
  }
}
