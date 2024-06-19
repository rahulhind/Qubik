import mongoose from "mongoose";

// const RoomSchema = new mongoose.Schema({
//   status: String,
// });

// export default mongoose.models.Room || mongoose.model("Room", RoomSchema);
const RoomSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ["waiting", "chatting", "inactive"], 
    default: "waiting",
  },
  users: {
    type: [String],
    default: [],
  },
});

RoomSchema.virtual("size").get(function () {
  return this.users.length;
});

export default mongoose.models.Room || mongoose.model("Room", RoomSchema);