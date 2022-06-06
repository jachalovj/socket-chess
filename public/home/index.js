const socket = io();

// 渲染房间列表
const genRoomList = (rooms) => {
    console.log(rooms);
    const $room = document.getElementById('room');
    const $watchRoom = document.getElementById('watchRoom');
    let html = '';
    let watchHtml = '';
    rooms.forEach(room => {
        if (room.aiPlay) return
        html += `<div title="加入房间" class="room-item ${room.play >=2 ? 'disabled' : ''}" onclick="enterRoom('${room.roomId}')">${room.roomId}</div>`;
        watchHtml += `<div title="观战" class="room-item" onclick="watchRoom('${room.roomId}')">${room.roomId}</div>`;
    });

    $room.innerHTML = html;
    $watchRoom.innerHTML = watchHtml;
}

// 获取房间列表
socket.emit('getRooms');
socket.on('getRooms', rooms => {
    console.log(rooms);
    genRoomList(rooms);
});

// 创建房间
const createRoom = () => {
    socket.emit('createRoom');
};

let $create = document.getElementById('create');
console.log($create);
$create.onclick = () => {
    createRoom();
};

// 创建房间
const createAIplay = () => {
  socket.emit('AIplay');
};

let $aiPlay = document.getElementById('AIplay');
console.log($aiPlay);
$aiPlay.onclick = () => {
  createAIplay();
}

// 监听人机对战
socket.on('AIplay', roomId => {
  aiPlay(roomId);
});

const aiPlay = (roomId) => {
  window.location.href = `/index?roomId=${roomId}&AIEnabled=true`;
}

// 监听创建房间是否成功
socket.on('createRoom', roomId => {
    enterRoom(roomId);
});

// 进入房间
const enterRoom = (roomId) => {
    window.location.href = `/index?roomId=${roomId}`;
};

// 观战
const watchRoom = (roomId) => {
    window.location.href = `/index?roomId=${roomId}&watch=true`;
}