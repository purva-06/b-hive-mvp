import { Router } from "express";

import {
  archiveMine,
  create,
  getPublished,
  listMine,
  listPublished,
  publishMine,
  updateMine,
} from "../controllers/articleController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import {
  articleIdSchema,
  articleListSchema,
  articleSlugSchema,
  createArticleSchema,
  myArticlesSchema,
  updateArticleSchema,
} from "../validators/articleValidators.js";
import {
  listForArticle,
  submit,
} from "../controllers/contributionController.js";
import {
  articleContributionListSchema,
  submitContributionSchema,
} from "../validators/contributionValidators.js";

const router = Router();

router.get(
  "/",
  validateRequest(articleListSchema),
  listPublished
);

router.get(
  "/me",
  protect,
  validateRequest(myArticlesSchema),
  listMine
);

router.post(
  "/",
  protect,
  validateRequest(createArticleSchema),
  create
);

router.patch(
  "/:articleId",
  protect,
  validateRequest(updateArticleSchema),
  updateMine
);

router.patch(
  "/:articleId/publish",
  protect,
  validateRequest(articleIdSchema),
  publishMine
);

router.patch(
  "/:articleId/archive",
  protect,
  validateRequest(articleIdSchema),
  archiveMine
);

router.post(
  "/:articleId/contributions",
  protect,
  validateRequest(
    submitContributionSchema
  ),
  submit
);

router.get(
  "/:articleId/contributions",
  protect,
  validateRequest(
    articleContributionListSchema
  ),
  listForArticle
);

router.get(
  "/:slug",
  validateRequest(articleSlugSchema),
  getPublished
);

export default router;