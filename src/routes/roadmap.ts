import { Router } from "express";
import protectRoute from "../middleware/auth";
import { createRoadmap,getRoadmap,getRoadmapById,deleteRoadmap} from "../controllers/roadmap.controller";
import {Roadmapsearch} from "../controllers/roadmap-serch.controller";
const router = Router();

router.post("/generate-roadmap",protectRoute(),createRoadmap);
router.get("/roadmaps",getRoadmap);
router.get("/:id",getRoadmapById);
router.delete("/:id",protectRoute(),deleteRoadmap);
router.get("/search",Roadmapsearch)

export default router;