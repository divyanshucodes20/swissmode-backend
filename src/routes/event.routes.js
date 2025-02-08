import { Router } from "express";
import auth from "../middlewares/auth.middleware.js";
import { getEvents, updateEvent, deleteEvent, createEvent, joinEvent, leaveEvent } from "../controllers/event.controller.js";
import {upload} from "../middlewares/multer.middleware.js";

const router = Router();

router.get("/", auth, getEvents);
router.post("/", auth, upload.single('image'), createEvent);
router.put("/:id", auth, upload.single('image'), updateEvent);
router.delete("/:id", auth, deleteEvent);
router.put("/join/:id", auth, joinEvent);
router.put("/leave/:id", auth, leaveEvent);

export default router;