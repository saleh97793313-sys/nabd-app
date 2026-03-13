import { Router, type IRouter } from "express";
import healthRouter from "./health";
import clinicsRouter from "./clinics";
import offersRouter from "./offers";
import appointmentsRouter from "./appointments";
import discountsRouter from "./discounts";
import statsRouter from "./stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use(clinicsRouter);
router.use(offersRouter);
router.use(appointmentsRouter);
router.use(discountsRouter);
router.use(statsRouter);

export default router;
