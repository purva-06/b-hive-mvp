import { Router } from "express";

import {
  accept,
  getOne,
  listMine,
  reject,
  requestChanges,
  resubmit,
  withdraw,
} from "../controllers/contributionController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import {
  acceptContributionSchema,
  contributionIdSchema,
  contributionListSchema,
  resubmitContributionSchema,
  reviewContributionSchema,
} from "../validators/contributionValidators.js";

const router = Router();

router.use(protect);

router.get(
  "/me",
  validateRequest(contributionListSchema),
  listMine
);

router.get(
  "/:contributionId",
  validateRequest(contributionIdSchema),
  getOne
);

router.patch(
  "/:contributionId/request-changes",
  validateRequest(reviewContributionSchema),
  requestChanges
);

router.patch(
  "/:contributionId/resubmit",
  validateRequest(
    resubmitContributionSchema
  ),
  resubmit
);

router.patch(
  "/:contributionId/withdraw",
  validateRequest(contributionIdSchema),
  withdraw
);

router.patch(
  "/:contributionId/reject",
  validateRequest(reviewContributionSchema),
  reject
);

router.patch(
  "/:contributionId/accept",
  validateRequest(acceptContributionSchema),
  accept
);

export default router;