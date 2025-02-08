import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import asyncHandler from "./utils/asyncHandler.js";
import { corsOptions, jsonOptions, urlEncodedOptions } from "./constants.js";
import { Server } from "socket.io";
import { createServer } from "http";
import Event from "./models/event.model.js"

const app = express();


app.use(cookieParser());
app.use(cors(corsOptions));
app.use(express.json(jsonOptions));
app.use(express.urlencoded(urlEncodedOptions));
app.use(express.static("public"));

import userRouter from "./routes/user.routes.js";
import eventRouter from "./routes/event.routes.js";

app.use("/api/v1/users", userRouter);
app.use("/api/v1/events", eventRouter);

app.use(
  "/api/v1/health",
  asyncHandler(async (req, res) => {
    res.status(200).json({ message: "Pathfinder Server is Running..." });
  })
);

const server = createServer(app);
const io = new Server(server, { cors: corsOptions });

io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("joinEvent", async (eventId) => {
        socket.join(eventId);

        try {
            const event = await Event.findById(eventId);
            if (!event) {
                console.error("Event not found");
                return;
            }
            io.to(eventId).emit("attendeeCountUpdate", event.attendees.length);

        } catch (error) {
            console.error("Error fetching event:", error);
        }
    });

    socket.on("leaveEvent", (eventId) => {
        socket.leave(eventId);
    });
    socket.on("updateAttendees", async (eventId) => {
        try {
            const event = await Event.findById(eventId);
            if (!event) {
                console.error("Event not found");
                return;
            }
            io.to(eventId).emit("attendeeCountUpdate", event.attendees.length);
        } catch (error) {
            console.error("Error updating attendees:", error);
        }
    });

    socket.on("disconnect", () => {
        console.log("A user disconnected");
    });
});

export { app, server };
