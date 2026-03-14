import { Router, type IRouter } from "express";
import healthRouter from "./health";
import clinicsRouter from "./clinics";
import offersRouter from "./offers";
import appointmentsRouter from "./appointments";
import discountsRouter from "./discounts";
import statsRouter from "./stats";
import authRouter from "./auth";
import ratingsRouter from "./ratings";
import pointsLogRouter from "./pointsLog";
import notificationsRouter from "./notifications";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(clinicsRouter);
router.use(offersRouter);
router.use(appointmentsRouter);
router.use(discountsRouter);
router.use(statsRouter);
router.use(ratingsRouter);
router.use(pointsLogRouter);
router.use(notificationsRouter);

export default router;
