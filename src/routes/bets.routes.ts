import { Router, Response, NextFunction } from "express";
import { validate } from "../middleware/validate.middleware";
import {
  authenticateUser,
  bindAuthenticatedWallet,
} from "../middleware/auth.middleware";
import { upDownBetSchema, precisionBetSchema } from "../schemas/bets.schema";
import betService from "../services/bet.service";

const router = Router();

/**
 * @swagger
 * /api/bets/up-down:
 *   post:
 *     summary: Submit an UP/DOWN bet (stub)
 *     tags: [bets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount, side]
 *             properties:
 *               address: { type: string, description: "Optional; must match JWT wallet when provided" }
 *               amount: { type: number }
 *               side: { type: string, enum: [UP, DOWN] }
 *     responses:
 *       200:
 *         description: Bet recorded (stub)
 *       401:
 *         description: Missing or invalid JWT
 *       400:
 *         description: Validation error
 */
router.post(
  "/up-down",
  authenticateUser,
  bindAuthenticatedWallet,
  validate(upDownBetSchema),
  (req, res: Response, next: NextFunction) => {
    try {
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
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount, predictedPrice]
 *             properties:
 *               address: { type: string, description: "Optional; must match JWT wallet when provided" }
 *               amount: { type: number }
 *               predictedPrice: { type: number }
 *     responses:
 *       200:
 *         description: Bet recorded (stub)
 *       401:
 *         description: Missing or invalid JWT
 *       400:
 *         description: Validation error
 */
router.post(
  "/precision",
  authenticateUser,
  bindAuthenticatedWallet,
  validate(precisionBetSchema),
  (req, res: Response, next: NextFunction) => {
    try {
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
