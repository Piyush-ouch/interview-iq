import express from "express";
import isAuth from "../middlewares/isAuth.js";
import {
  createBooking,
  getUserBookings,
  cancelBooking,
  rescheduleBooking,
  exportICS,
} from "../controllers/booking.controller.js";

const bookingRouter = express.Router();

bookingRouter.post("/schedule", isAuth, createBooking);
bookingRouter.get("/my-bookings", isAuth, getUserBookings);
bookingRouter.patch("/:id/cancel", isAuth, cancelBooking);
bookingRouter.patch("/:id/reschedule", isAuth, rescheduleBooking);
bookingRouter.get("/:id/ics", isAuth, exportICS);

export default bookingRouter;
