import { describe, it, expect, beforeAll } from "@jest/globals";
import request from "supertest";
import { Express } from "express";
import { UserRole } from "@prisma/client";
import { createApp } from "../index";
import { generateToken } from "../utils/jwt.util";

jest.mock("../middleware/rateLimiter.middleware", () => ({
  challengeRateLimiter: (_req: any, _res: any, next: any) => next(),
  connectRateLimiter: (_req: any, _res: any, next: any) => next(),
  authRateLimiter: (_req: any, _res: any, next: any) => next(),
  chatMessageRateLimiter: (_req: any, _res: any, next: any) => next(),
  predictionRateLimiter: (_req: any, _res: any, next: any) => next(),
  adminRoundRateLimiter: (_req: any, _res: any, next: any) => next(),
  oracleResolveRateLimiter: (_req: any, _res: any, next: any) => next(),
}));

const mockUserFindUnique = jest.fn();

jest.mock("../lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: (...args: any[]) => mockUserFindUnique(...args),
    },
    $disconnect: jest.fn().mockResolvedValue(undefined),
  },
}));

const VALID_ADDRESS = "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF";
const TEST_USER_ID = "bets-test-user-id";

describe("Bets Routes - JWT protected endpoints", () => {
  let app: Express;
  let validToken: string;

  beforeAll(() => {
    app = createApp();
    validToken = generateToken(TEST_USER_ID, VALID_ADDRESS, UserRole.USER);
    mockUserFindUnique.mockImplementation((args: any) => {
      if (args?.where?.id === TEST_USER_ID) {
        return Promise.resolve({
          id: TEST_USER_ID,
          walletAddress: VALID_ADDRESS,
          role: UserRole.USER,
        });
      }
      return Promise.resolve(null);
    });
  });

  describe("POST /api/bets/up-down", () => {
    it("rejects unauthenticated bet attempts with 401", async () => {
      const res = await request(app)
        .post("/api/bets/up-down")
        .send({ amount: 10, side: "UP" });

      expect(res.status).toBe(401);
      expect(res.body.error).toMatch(/token/i);
    });

    it("returns 200 stub for authenticated UP/DOWN payload", async () => {
      const res = await request(app)
        .post("/api/bets/up-down")
        .set("Authorization", `Bearer ${validToken}`)
        .send({ amount: 10, side: "UP" });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        success: true,
        message: "Bet recorded (stub)",
      });
    });

    it("rejects mismatched wallet address with 403", async () => {
      const res = await request(app)
        .post("/api/bets/up-down")
        .set("Authorization", `Bearer ${validToken}`)
        .send({
          address: "GBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
          amount: 10,
          side: "UP",
        });

      expect(res.status).toBe(403);
      expect(res.body.error).toMatch(/match authenticated user/i);
    });

    it("returns 400 when required fields are missing", async () => {
      const res = await request(app)
        .post("/api/bets/up-down")
        .set("Authorization", `Bearer ${validToken}`)
        .send({ amount: 10 });

      expect(res.status).toBe(400);
      expect(res.body.success).toBeUndefined();
      expect(res.body.message).toBeDefined();
    });
  });

  describe("POST /api/bets/precision", () => {
    it("rejects unauthenticated bet attempts with 401", async () => {
      const res = await request(app)
        .post("/api/bets/precision")
        .send({ amount: 5, predictedPrice: 0.12 });

      expect(res.status).toBe(401);
    });

    it("returns 200 stub for authenticated Precision payload", async () => {
      const res = await request(app)
        .post("/api/bets/precision")
        .set("Authorization", `Bearer ${validToken}`)
        .send({ amount: 5, predictedPrice: 0.12 });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        success: true,
        message: "Bet recorded (stub)",
      });
    });

    it("returns 400 when predictedPrice is missing", async () => {
      const res = await request(app)
        .post("/api/bets/precision")
        .set("Authorization", `Bearer ${validToken}`)
        .send({ amount: 5 });

      expect(res.status).toBe(400);
      expect(res.body.message).toBeDefined();
    });
  });
});
