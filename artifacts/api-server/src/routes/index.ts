import { Router, type IRouter } from "express";
import healthRouter from "./health";
import travelSageRouter from "./travelsage";

const router: IRouter = Router();

router.use(healthRouter);
router.use(travelSageRouter);

export default router;
