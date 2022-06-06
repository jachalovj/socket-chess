const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

app.use(express.static('./public'));

app.get('/', (req, res) => {
    res.redirect('/home');
});

app.get('/index', (req, res) => {
    res.sendFile('./public/index/index.html');
});

app.get('/home', (req, res) => {
    res.sendFile('./public/home/index.html');
});

let rooms = [];
io.on('connection', socket => {
    console.log('有客户端连接了');
    // 返回房间列表
    socket.on('getRooms', () => {
        socket.emit('getRooms', rooms);
    });

    // 创建房间
    socket.on('createRoom', () => {
        let roomId = 'room_' + parseInt(Math.random() * 100);
        rooms.push({
            play: 0,
            chessColor: null,
            roomId,
            socket: {
                play: [],
                watch: []
            }
        });
        socket.emit('createRoom', roomId);
        // 提醒所有客户端刷新房间列表
        socket.broadcast.emit('getRooms', rooms);
    });

    // 观战
    // socket.on('watch', roomId => {
    //     const room = rooms.find(r => r.roomId === roomId);
    //     room.socket.watch.push(socket);
    //     // 向其它客户端广播，索要棋盘数据
    //     let playSocket = room.socket.play[0];
    //     if (playSocket) {
    //         playSocket.on('getChessBoard', chessBoard => {
    //             socket.emit('watch', chessBoard);
    //         });
    //         playSocket.emit('getChessBoard', playSocket);
    //     }
    // });

    // AI对战, AI不可观战
    socket.on('AIplay', () => {
      let roomId = 'room_' + parseInt(Math.random() * 100);
      rooms.push({
        play: 1,
        chessColor: null,
        aiPlay: true,
        roomId,
        socket: {
            play: [],
            watch: []
        }
    });
      socket.emit('AIplay', roomId);
    })

    // 下子
    socket.on('chess', (roomId, chessInfo) => {
        console.log('chess', roomId);
        socket.broadcast.to(roomId).emit('chess', chessInfo);
    });
    // 进入房间
    socket.on('register', (roomId, color) => {
        socket.join(roomId);
        const room = rooms.find(r => r.roomId === roomId);
        room.play ++;
        // room.socket.play.push(socket);
        if (room) {
            // 提醒所有客户端刷新房间列表
            socket.broadcast.emit('getRooms', rooms);
            socket.emit('getRooms', rooms);

            if (room.chessColor === color) {
                socket.emit('used');
            } else {
                room.chessColor = color;
            }
            socket.emit('success', roomId);

            // 是否已就绪
            if (room.play % 2 === 0) {
                socket.broadcast.to(roomId).emit('ready');
                socket.emit('ready');
            }
        }
    });
    // 是否有一方获胜
    socket.on('win', (roomId, isBlack) => {
        socket.emit('win', isBlack);
        socket.broadcast.to(roomId).emit('win', isBlack);
    });
});

server.listen(3000, () => {
    console.log('listen 3000 ......');
});