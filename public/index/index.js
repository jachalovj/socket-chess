// 是否分出输赢
let win = false;
// 是否开启AI
let AIEnabled = false;
// 是否为等待状态
let waiting = true;
// 棋子颜色(true: 黑， false: 白)
let chessColor = Math.random() > 0.5;
// 切换黑白棋
let me = true;
// 储存棋盘落子情况
let chessBoard = [];
// 是否为观战状态
let watch = false;
// 画布变量
const chess = document.getElementById('chess');
const context = chess.getContext('2d');
context.strokeStyle='#000';

// 获取url的query参数
const getQueryVariable = (variable) => {
    let href = window.location.href;
    const query = href.slice(href.lastIndexOf('?') + 1);
    const vars = query.split('&');
    for (let i = 0; i < vars.length; i++) {
        const pair = vars[i].split('=');
        if (pair[0] === variable) {
            return pair[1];
        }
    }
    return false;
}

const message = document.getElementById('message');
const setMessage = () => {
    if (chessColor) {
        message.innerHTML = `你执黑子先行`
    } else {
        message.innerHTML = `你执白子后行`;
    }
}

const socket = io();

// 获取当前观战的棋盘信息
socket.on('watch', cboard => {
    chessBoard = cboard;
    chessBack();
});

// 监听获取棋盘
socket.on('getChessBoard', () => {
    socket.emit('getChessBoard', chessBoard);
});

// 获取roomId
const roomId = getQueryVariable('roomId');
watch = getQueryVariable('watch');
AIEnabled = getQueryVariable('AIEnabled')

if (roomId) {
    console.log(roomId);
    if (watch) {
        socket.emit('watch', roomId);
    } else {
        // 注册当前用户
        socket.emit('register', roomId, chessColor);
        setMessage();
        // 初始化棋盘信息
        initChessBoard();
    }
}

const roomIdDom = document.getElementById('roomId');
socket.on('success', roomId => {
    roomIdDom.innerHTML = `房间号：${roomId}, 等待中....`;
});

socket.on('win', isBlack => {
    win = true;
    alert(isBlack ? '黑棋赢了' : '白棋赢了');
});

socket.on('ready', () => {
    waiting = false;
    roomIdDom.innerHTML = roomIdDom.innerHTML.replace('等待中....', '已就绪');
});

const tipDom = document.getElementById('tip');
socket.on('chess', chessInfo => {
    console.log('chess');
    drawChess(chessInfo.i, chessInfo.j, chessInfo.me);
});

socket.on('used', () => {
    chessColor = !chessColor;
    setMessage();
});

// 画棋盘
function drawChessBoard() {
    for (let i = 0; i < 15; i++) {
        let start = 15 + 30 * i;
        // 画竖线
        context.moveTo(start, 15);
        context.lineTo(start, 450 - 15);
        context.stroke();
        // 画横线
        context.moveTo(15, start);
        context.lineTo(450 - 15, start);
        context.stroke();
    }
}
drawChessBoard();

// 棋盘回溯
function chessBack() {
    // 清空画布
    for (let i = 0; i < chessBoard.length; i++) {
        for (let j = 0; j < chessBoard[i].length; i++) {
            drawChess(i, j, chessBoard[i][j] === 1);
        }
    }
}

// 画棋子
function drawChess(i, j, isBlack) {
    // 代表黑棋
    chessBoard[i][j] = isBlack ? 1 : 2;
    context.beginPath();
    let x = 15 + i * 30, y = 15 + j * 30;
    context.arc(x, y, 13, 0, 2 * Math.PI);
    context.closePath();
    let gradient = context.createRadialGradient(x + 2, y - 2, 7, x + 2, y - 2, 2);
    // 黑棋
    if (isBlack) {
        gradient.addColorStop(0, '#0a0a0a');
        gradient.addColorStop(1, '#636766');
        // 白棋
    } else {
        gradient.addColorStop(0, '#d1d1d1');
        gradient.addColorStop(1, '#f9f9f9');
    }

    context.fillStyle = gradient;

    context.fill();

    // 提示
    tipDom.style.backgroundImage = me ? "radial-gradient(#f9f9f9, #d1d1d1)" : "radial-gradient(#636766, #0a0a0a)";
    // 改变棋子颜色
    me = !me;
}

// 初始化棋盘落子
function initChessBoard() {
    for (let i = 0; i < 15; i++) {
        chessBoard[i] = [];
        for (let j = 0; j < 15; j++) {
            // 代表没有下子
            chessBoard[i][j] = 0;
        }
    }
}

// 赢法数组
let wins = [];
// 赢法总量
let count = 0;
function initWins() {
    // 初始化
    for (let i = 0; i < 15; i++) {
        wins[i] = [];
        for (let j = 0; j < 15; j++) {
            wins[i][j] = [];
        }
    }
    // 横线赢法
    for (let i = 0; i < 15; i++) {
        for (let j = 0; j < 11; j++) {
            //  0 0 0
            //  0 1 0
            //  0 2 0
            //  0 3 0
            //  0 4 0
            for (let k = 0; k < 5; k++) {
                wins[i][j + k][count] = true;
            }
            // 赢法加一
            count++;
        }
    }

    // 竖线赢法
    for (let i = 0; i < 11; i++) {
        for (let j = 0; j < 15; j++) {
            //  0 1 0
            //  1 1 0
            //  2 1 0
            //  3 1 0
            //  4 1 0
            for (let k = 0; k < 5; k++) {
                wins[i + k][j][count] = true;
            }
            // 赢法加一
            count++;
        }
    }

    // 正斜线赢法
    for (let i = 0; i < 11; i++) {
        for (let j = 0; j < 11; j++) {
            //  0 0  0 1   1 0
            //  1 1  1 2   2 1
            //  2 2  2 3   3 2
            //  3 3  3 4   4 3
            //  4 4  4 5   5 4
            for (let k = 0; k < 5; k++) {
                wins[i + k][j + k][count] = true;
            }
            // 赢法加一
            count++;
        }
    }

    // 反斜线赢法
    for (let i = 0; i < 11; i++) {
        for (let j = 4; j < 15; j++) {
            //  0 4  0 14
            //  1 3  1 13
            //  2 2  2 12
            //  3 1  3 11
            //  4 0  4 10
            for (let k = 0; k < 5; k++) {
                wins[i + k][j - k][count] = true;
            }
            // 赢法加一
            count++;
        }
    }
}
initWins();

// 我方赢法统计数组
let myWins = new Array(count);
myWins.fill(0);
// AI赢法统计数组
let AIWins = new Array(count);
AIWins.fill(0);


// 获取当前赢法的五颗棋子的坐标
function getCoordinates(k) {
    let res = [];
    for (let i = 0; i < 15; i++) {
        for (let j = 0; j < 15; j++) {
            if (wins[i][j][k]) {
                res.push([i, j]);
            }
        }
    }
    return res;
}

// 查找当前赢法中还未落子的棋子坐标
function getEnableCoordinate(coordinates) {
    return coordinates.find(item => {
        let i = item[0];
        let j = item[1];
        return chessBoard[i][j] === 0;
    });
}

// AI下棋, 不让你赢，有利于自己赢
function AI() {
    // 设置权重
    let weight = 3;
   // 遍历我方赢法统计数组
   for (let i = 0; i < count; i++) {
       if (myWins[i] >= weight) {
            // 拿到当前的赢法数组
            let arr = getCoordinates(i);
            // 拿到可用的棋子坐标
            let xy = getEnableCoordinate(arr);
            // 落子
            drawChess(...xy, false);
            // 代表白棋
            chessBoard[xy[0]][xy[1]] = 2;
            // 更新赢法统计数组
            for (let k = 0; k < count; k++) {
                // 说明触发了一种赢法
                if (wins[xy[0]][xy[1]][k]) {
                    AIWins[k]++;
                }
                if (AIWins[k] === 5) {
                    alert('AI赢了');
                    break;
                }
            }
            return;
        }
   }

   // 遍历AI赢法统计数组
   for (let i = 0; i < count; i++) {
        if (AIWins[i] >= 1) {
            // 拿到当前的赢法数组
            let arr = getCoordinates(i);
            // 拿到可用的棋子坐标
            let xy = getEnableCoordinate(arr);
            // 落子
            drawChess(...xy, false);
            // 代表白棋
            chessBoard[xy[0]][xy[1]] = 2;
            // 更新赢法统计数组
            for (let k = 0; k < count; k++) {
                // 说明触发了一种赢法
                if (wins[xy[0]][xy[1]][k]) {
                    AIWins[k]++;
                }
                if (AIWins[k] === 5) {
                    alert('AI赢了');
                    break;
                }
            }
            return;
        }
    }
}
// 落子
chess.onclick = function (e) {
    // 观战状态，不允许落子
    if (watch) {
        return;
    }
    // 等待状态，不允许落子
    if (waiting) {
        return;
    }
    // 输赢已定，不能再落子了
    if (win) {
        return;
    }
    // AI落子
    if (AIEnabled && !me) {
        return;
    }
    // 是否是自己的回合
    if (chessColor !== me) {
        return;
    }
    let offsetX = e.offsetX;
    let offsetY = e.offsetY;
    let i = Math.floor(offsetX / 30);
    let j = Math.floor(offsetY / 30);
    // 当前节点没有下棋
    if (chessBoard[i][j] === 0) {
        // 通知其他客户端更新棋盘
        socket.emit('chess', roomId, { i, j, me});
        // 落子
        drawChess(i, j, me);
        // 更新赢法统计数组
        for (let k = 0; k < count; k++) {
            if (!me) {
                // 说明触发了一种赢法
                if (wins[i][j][k]) {
                    myWins[k]++;
                }
                if (myWins[k] === 5) {
                    win = true;
                    socket.emit('win', roomId, chessColor);
                    break;
                }
            } else {
                // 说明触发了一种赢法
                if (wins[i][j][k]) {
                    AIWins[k]++;
                }
                if (AIWins[k] === 5) {
                    win = true;
                    socket.emit('win', roomId, chessColor);
                    break;
                }
            }
        }
        if (AIEnabled) {
            // AI落子
            computer();
        }
    }
}


function computer() {
    // 统计棋盘每个点的得分
    let myScore = [], AIScore = [];
    // 定义最大分值， 默认是零
    let max = 0, u = 0, v = 0;
    // 初始化得分
    for (let i = 0; i < 15; i++) {
        myScore[i] = [];
        AIScore[i] = [];
        for (let j = 0; j < 15; j++) {
            myScore[i][j] = 0;
            AIScore[i][j] = 0;
        }
    }

    // 计算每个点的得分
    for (let i = 0; i < 15; i++) {
        for (let j = 0; j < 15; j++) {
            if (chessBoard[i][j] === 0) {
                for (let k = 0; k < count; k++) {
                    if (wins[i][j][k]) {
                        // 我方赢法得分
                        switch(myWins[k]) {
                            case 1: myScore[i][j] += 200;break;
                            case 2: myScore[i][j] += 500;break;
                            case 3: myScore[i][j] += 1000;break;
                            case 4: myScore[i][j] += 10000;break;
                        }
                        // AI赢法得分
                        switch(AIWins[k]) {
                            case 1: AIScore[i][j] += 200;break;
                            case 2: AIScore[i][j] += 500;break;
                            case 3: AIScore[i][j] += 1000;break;
                            case 4: AIScore[i][j] += 10000;break;
                        }
                    }
                }
            }
            // 判断当前分值是否大于最大分值
            if (myScore[i][j] > max) {
                max = myScore[i][j];
                u = i;
                v = j;
            } else if (myScore[i][j] === max) {
                if (AIScore[i][j] > AIScore[u][v]) {
                    u = i;
                    v = j;
                }
            }
        }
    }

    // 落子
    drawChess(u, v, me);
    chessBoard[u][v] = 2;
    // 更新赢法统计数组
    for (let k = 0; k < count; k++) {
        // 说明触发了一种赢法
        if (wins[u][v][k]) {
            AIWins[k]++;
        }
        if (AIWins[k] === 5) {
            win = true;
            alert('AI赢了');
            break;
        }
    }
}


