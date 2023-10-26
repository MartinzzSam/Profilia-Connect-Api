const expressAsyncHandler = require("express-async-handler");
const Pusher = require("pusher");

 pusher = new Pusher({
  appId: "1655596",
  key: "4e0582fefc1d23fbe3f1",
  secret: "afa81a67207273ff2092",
  cluster: "eu",
  useTLS: true,
});



pusherAuth = expressAsyncHandler(async (req, res) => {
  const socketId = req.body.socket_id;
  const channelName = req.body.channel_name;
  const channelData = {
    user_id: 'unique_user_id',
    user_info: {
      name: 'Phil Leggetter'
    }
  };
  const authResponse = pusher.authenticate(socketId, channelName);;
  res.send(authResponse);
});

// exports.getConnectedUsers = expressAsyncHandler(async (req, res) => {

// })

module.exports = { pusher  , pusherAuth}








// app.post(
//   "/api/v1/pusher/user-auth/:id",

// );
