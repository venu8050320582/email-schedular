import { Router } from "express";
import { searchEmailController } from "../controllers/search.controller";

const router = Router();

router.get("/", searchEmailController);

export default router;