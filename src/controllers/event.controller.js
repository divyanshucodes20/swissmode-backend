import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import {deleteFromCloudinary, uploadOnCloudinary} from "../utils/cloudinary.js"
import Event from "../models/event.model.js";
import ApiResponse from "../utils/ApiResponse.js";

const createEvent = asyncHandler(async(req, res) => {
    const {name,description,location,date,time} = req.body;
    const image=req.file;
    if([name,description,location,date,time].some((field)=>field?.trim()==="")){
        throw new ApiError(400,"All Fields are Required!");
    }
    if(!image){
        throw new ApiError(400,"Image is Required!");
    }
    const resImage=await uploadOnCloudinary(image.path);
    const event=await Event.create({
        name,
        description,
        location,
        date,
        time,
        image:resImage.url,
        organizer:req.user._id
    });
    return res.status(201).json(new ApiResponse(201,"","Event Created Successfully!"));
});
const getEvents= asyncHandler(async(req, res) => {
    const {category,date,location}=req.query;
    let query={};
    if(category){
        query.category=category;
    }
    if(date){
        query.date=date;
    }
    if(location){
        query.location=location;
    }
    const events=await Event.find(query).populate("organizer","name");
    return res.status(200).json(new ApiResponse(200,events,"Events Fetched Successfully!"));
});
const updateEvent= asyncHandler(async(req, res) => {
    const {name,description,location,date,time}=req.body;
    const image=req.file;
    if([name,description,location,date,time].some((field)=>field?.trim()==="")){
        throw new ApiError(400,"All Fields are Required!");
    }
    const event=await Event.findById(req.params.id);
    if(!event){
        throw new ApiError(404,"Event not found!");
    }
    if(req.user._id.toString()!==event.organizer.toString()){
        throw new ApiError(403,"You are not allowed to update this event!");
    }
    let resImage;
    if(image){
        resImage=await uploadOnCloudinary(image.path);
    }
    const updatedEvent=await Event.findByIdAndUpdate(req.params.id,{
        name,
        description,
        location,
        date,
        time,
        image:resImage?.url || event.image
    },{new:true});
    return res.status(200).json(new ApiResponse(200,updatedEvent,"Event Updated Successfully!"));
});
const deleteEvent= asyncHandler(async(req, res) => {
    const event=await Event.findById(req.params.id);
    if(!event){
        throw new ApiError(404,"Event not found!");
    }
    if(req.user._id.toString()!==event.organizer.toString()){
        throw new ApiError(403,"You are not allowed to delete this event!");
    }
    await deleteFromCloudinary(event.image.public_id);
    await Event.findByIdAndDelete(req.params.id);
    return res.status(200).json(new ApiResponse(200,"","Event Deleted Successfully!"));
});
const joinEvent = asyncHandler(async (req, res) => {
   const id=req.params.id;
    const event=await Event.findById(id);
    if(!event){
        throw new ApiError(404,"Event not found!");
    }
    if(event.attendees.includes(req.user._id)){
        throw new ApiError(400,"You have already joined this event!");
    }
    if(event.organizer.toString()===req.user._id.toString()){
        throw new ApiError(400,"You cannot join your own event!");
    }
    event.attendees.push(req.user._id);
    await event.save();
    const io = req.app.get('io')
     io.to(req.params.id).emit('attendeeCountUpdate', event.attendees.length);
    res.status(200).json(event);
    return res.status(200).json(new ApiResponse(200,"","Joined Event Successfully!"));
    });
const leaveEvent = asyncHandler(async (req, res) => {
    const id=req.params.id;
    const event=await Event.findById(id);
    if(!event){
        throw new ApiError(404,"Event not found!");
    }
    if(!event.attendees.includes(req.user._id)){
        throw new ApiError(400,"You have not joined this event!");
    }
    event.attendees = event.attendees.filter(attendee => attendee.toString() !== req.user._id.toString());

    await event.save();
   const io = req.app.get('io') 
   io.to(req.params.id).emit('attendeeCountUpdate', event.attendees.length);
    return res.status(200).json(new ApiResponse(200,"","Left Event Successfully!"));
});
export {createEvent,getEvents,updateEvent,deleteEvent,joinEvent,leaveEvent};
