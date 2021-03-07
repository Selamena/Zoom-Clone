const express = require("express");
const app = express();
const Server = require("http").Server(app);
const io = require('socket.io')(Server);
const { v4: uuidv4 } = require('uuid');
const {ExpressPeerServer} = require("peer")
const peerServer = ExpressPeerServer(Server,{debug: true,})
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use('/peerjs', peerServer);
app.get("/", (req, res) => {
   res.redirect(`/${uuidv4()}`)
})
app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room });
});

io.on("connection", (socket) => {
    socket.on("join-room", ( roomId,userId ) => {
        socket.join(roomId);
        socket.to(roomId).broadcast.emit('user_connected',userId)
        // console.log("someone joined");
        socket.on('message', (message) => {
          io.to(roomId).emit("createMessage", message);
        })
        socket.on("disconnect", () => {
					socket.to(roomId).broadcast.emit("user_disconnected", userId);
				});
    });   
});


Server.listen(process.env.PORT || 3000);

