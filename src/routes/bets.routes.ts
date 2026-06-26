import { Router, Response, NextFunction } from "express";
import { validate } from "../middleware/validate.middleware";
import { verifyStellarAuth, AuthenticatedRequest } from "../middleware/auth.middleware";
import { upDownBetSchema, precisionBetSchema } from "../schemas/bets.schema";
import betService from "../services/bet.service";

const router = Router();

/**
 * @swagger
 * /api/bets/up-down:
 *   post:
 *     summary: Submit an UP/DOWN bet (stub)
 *     tags: [bets]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [address, amount, side]
 *             properties:
 *               address: { type: string }
 *               amount: { type: number }
 *               side: { type: string, enum: [UP, DOWN] }
 *     responses:
 *       200:
 *         description: Bet recorded (stub)
 *       400:
 *         description: Validation error
 */
router.post(
  "/up-down",
  verifyStellarAuth,
  validate(upDownBetSchema),
  (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { address } = req.body;
      const authenticatedAddress = req.walletAddress;

      if (!authenticatedAddress) {
        return res.status(401).json({ error: "Authentication required" });
      }

      if (address !== authenticatedAddress) {
        return res.status(403).json({
          error: "Spoofing detected: Authenticated wallet does not match request body data.",
        });
      }

      // TODO: Call contract via Xelma TypeScript bindings — bets must go on-chain;
      // this endpoint is logging/analytics only for now
      betService.recordUpDownBet(req.body);
      res.json({ success: true, message: "Bet recorded (stub)" });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * @swagger
 * /api/bets/precision:
 *   post:
 *     summary: Submit a Precision bet (stub)
 *     tags: [bets]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [address, amount, predictedPrice]
 *             properties:
 *               address: { type: string }
 *               amount: { type: number }
 *               predictedPrice: { type: number }
 *     responses:
 *       200:
 *         description: Bet recorded (stub)
 *       400:
 *         description: Validation error
 */
router.post(
  "/precision",
  verifyStellarAuth,
  validate(precisionBetSchema),
  (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { address } = req.body;
      const authenticatedAddress = req.walletAddress;

      if (!authenticatedAddress) {
        return res.status(401).json({ error: "Authentication required" });
      }

      if (address !== authenticatedAddress) {
        return res.status(403).json({
          error: "Spoofing detected: Authenticated wallet does not match request body data.",
        });
      }

      // TODO: Call contract via Xelma TypeScript bindings — bets must go on-chain;
      // this endpoint is logging/analytics only for now
      betService.recordPrecisionBet(req.body);
      res.json({ success: true, message: "Bet recorded (stub)" });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
