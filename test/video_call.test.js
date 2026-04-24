const { io } = require("socket.io-client");

const URL = "http://localhost:3000/video";

const user1 = io(URL);
const user2 = io(URL);

// =======================
// CONNECT
// =======================
user1.on("connect", () => {
  console.log("[user1] connected:", user1.id);
  user1.emit("register", "user1");
});

user2.on("connect", () => {
  console.log("[user2] connected:", user2.id);
  user2.emit("register", "user2");
});

// =======================
// REGISTER
// =======================
user1.on("registered", (data) => {
  console.log("[user1] registered:", data);
});

user2.on("registered", (data) => {
  console.log("[user2] registered:", data);
});

// =======================
// CALL FLOW
// =======================

// user2 nhận cuộc gọi
user2.on("incoming-call", (data) => {
  console.log("[user2] incoming-call:", data);

  // accept luôn
  user2.emit("call-accepted", {
    callId: data.callId,
    from: data.from,
    to: "user2",
  });
});

// user1 nhận accepted
user1.on("call-accepted", (data) => {
  console.log("[user1] call accepted:", data);

  // gửi offer giả
  user1.emit("offer", {
    callId: data.callId,
    from: "user1",
    to: "user2",
    offer: { sdp: "fake-offer", type: "offer" },
  });
});

// user2 nhận offer
user2.on("offer", (data) => {
  console.log("[user2] received offer:", data);

  // gửi answer giả
  user2.emit("answer", {
    callId: data.callId,
    from: "user2",
    to: data.from,
    answer: { sdp: "fake-answer", type: "answer" },
  });
});

// user1 nhận answer
user1.on("answer", (data) => {
  console.log("[user1] received answer:", data);

  // gửi ICE
  user1.emit("ice-candidate", {
    callId: data.callId,
    from: "user1",
    to: "user2",
    candidate: { candidate: "fake-candidate" },
  });
});

// user2 nhận ICE
user2.on("ice-candidate", (data) => {
  console.log("[user2] received ICE:", data);

  // end call
  user2.emit("end-call", {
    callId: data.callId,
    from: "user2",
    to: "user1",
  });
});

// user1 nhận end
user1.on("call-ended", (data) => {
  console.log("[user1] call ended:", data);

  console.log("\n TEST DONE\n");
  process.exit(0);
});

// =======================
// START CALL
// =======================
setTimeout(() => {
  console.log("\n[user1] calling user2...\n");

  user1.emit("video-call", {
    callId: "call-1",
    from: "user1",
    to: "user2",
    channelId: "room-1",
  });
}, 1500);