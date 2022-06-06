const socket = io();

// 渲染房间列表
const genRoomList = (rooms) => {
    const $room = document.getElementById('room');
    // const $watchRoom = document.getElementById('watchRoom');
    let html = '';
    // let watchHtml = '';
    rooms.forEach(room => {
        if (room.aiPlay) return
        html += `<div title="加入房间" class="room-item ${room.play >=2 ? 'disabled' : ''}" onclick="enterRoom('${room.roomId}')">${room.roomId}</div>`;
        // watchHtml += `<div title="观战" class="room-item" onclick="watchRoom('${room.roomId}')">${room.roomId}</div>`;
    });

    $room.innerHTML = html;
    // $watchRoom.innerHTML = watchHtml;
}
// 创建房间
const createRoom = () => {
  socket.emit('createRoom');
};

// 创建AI
const createAIplay = () => {
  socket.emit('AIplay');
};

// 获取房间列表
const getRoomList = () => {
  socket.emit('getRooms');
}

// 给创建房间添加点击事件
let $create = document.getElementById('create');
$create.onclick = () => {
    createRoom();
};

// 给创建AI添加点击事件
let $aiPlay = document.getElementById('AIplay');
$aiPlay.onclick = () => {
  createAIplay();
}

/**
 * 路由跳转
 */
// 进入房间
const enterRoom = (roomId) => {
    window.location.href = `/index?roomId=${roomId}`;
};

// 观战
// const watchRoom = (roomId) => {
//     window.location.href = `/index?roomId=${roomId}&watch=true`;
// }

// AI 对战
const aiPlay = (roomId) => {
  window.location.href = `/index?roomId=${roomId}&AIEnabled=true`;
}


/**
 * 监听事件
 */
// 监听创建房间是否成功
socket.on('createRoom', roomId => {
  enterRoom(roomId);
});


// 监听获取房间列表
socket.on('getRooms', rooms => {
  genRoomList(rooms);
});

// 监听人机对战
socket.on('AIplay', roomId => {
  aiPlay(roomId);
});

// 首页房间列表
getRoomList();