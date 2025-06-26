import express from "express";
import { 
    getInTouch
} from "../controllers/getInTouch.controller.js";

const router = express.Router();

// Create a new customer
router.post("/", getInTouch);


export default router;
