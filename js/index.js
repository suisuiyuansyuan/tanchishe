var sw = 20,
    sh = 20,
    tr = 30,
    td = 30;

var snake = null;
var food = null;
var game = null; //游戏的实例

//方块构造函数
function Square(x, y, classname) {
    this.x = x * sw;
    this.y = y * sh;
    this.class = classname;

    this.viewContent = document.createElement('div');
    this.viewContent.className = this.class;
    this.parent = document.getElementById('snakeWrap');

}

Square.prototype.create = function() {
    this.viewContent.style.position = 'absolute';
    this.viewContent.style.width = sw + 'px';
    this.viewContent.style.height = sh + 'px';
    this.viewContent.style.left = this.x + 'px';
    this.viewContent.style.top = this.y + 'px';

    this.parent.appendChild(this.viewContent);

};

Square.prototype.remove = function() {
    this.parent.removeChild(this.viewContent);
}

//蛇
function Snake() {
    this.head = null; //存一下蛇头的信息
    this.tail = null;
    this.pos = [

    ]; //存储方块的位置
    this.directionNum = { //存储蛇的方向
        left: {
            x: -1,
            y: 0,
            rotate: 180
        },
        right: {
            x: 1,
            y: 0,
            rotate: 0
        },
        up: {
            x: 0,
            y: -1,
            rotate: -90
        },
        down: {

            y: 1,
            x: 0,
            rotate: 90
        }

    }
}


Snake.prototype.init = function() {
    //创建蛇头
    var snakeHead = new Square(2, 0, 'snakeHead');
    snakeHead.create();
    this.head = snakeHead;
    this.pos.push([2, 0]);

    //创建蛇身体
    var snakeBody1 = new Square(1, 0, 'snakeBody');
    snakeBody1.create();
    this.pos.push([1, 0]);

    var snakeBody2 = new Square(0, 0, 'snakeBody');

    snakeBody2.create();
    this.tail = snakeBody2; //把蛇尾的信息存起来
    this.pos.push([0, 0]);

    //形成链表关系
    snakeHead.last = null;
    snakeHead.next = snakeBody1;

    snakeBody1.last = snakeHead;
    snakeBody1.next = snakeBody2;

    snakeBody2.last = snakeBody1;
    snakeBody2.next = null;

    //給蛇一个属性，表示蛇的方式
    this.direction = this.directionNum.right;
}

//用来获取蛇头的下一个位置元素

Snake.prototype.getNextPos = function() {
    var nextPos = [
        this.head.x / sw + this.direction.x,
        this.head.y / sh + this.direction.y
    ]

    //下个点是自己，代表吃力自己，游戏结束
    var selfCollied = false;
    this.pos.forEach(function(value) {
        if (value[0] == nextPos[0] && value[1] == nextPos[1]) {
            selfCollied = true;
        }
    })
    if (selfCollied) {
        console.log('你吃了自己');
        this.strategies.die.call(this);
        return;
    }
    //下个点是墙，游戏结束
    if (nextPos[0] < 0 || nextPos[1] < 0 || nextPos[0] > 29 || nextPos[1] > 29) {
        console.log('撞到墙了')
        this.strategies.die.call(this);
        return;
    }
    //小苹果，吃
    if (food && food.pos[0] == nextPos[0] && food.pos[1] == nextPos[1]) {
        console.log('吃到了')
        this.strategies.eat.call(this);
        return;
    }
    //什么都不是,走
    this.strategies.move.call(this);
}

//处理碰撞后要做的事

Snake.prototype.strategies = {
    move: function(format) {
        var newBody = new Square(this.head.x / sw, this.head.y / sh, 'snakeBody');

        newBody.next = this.head.next;
        newBody.next.last = newBody;
        newBody.last = null;

        this.head.remove();
        newBody.create();
        // console.log('move');
        // console.log(this);

        //蛇头要走的下一个点
        var newHead = new Square(this.head.x / sw + this.direction.x, this.head.y / sh + this.direction.y, 'snakeHead');
        newHead.next = newBody;
        newHead.last = null;
        newBody.last = newHead;

        newHead.viewContent.style.transform = 'rotate(' + this.direction.rotate + 'deg)'
            //蛇身上的方块更新
        newHead.create();

        this.pos.splice(0, 0, [this.head.x / sw + this.direction.x, this.head.y / sh + this.direction.y]);
        this.head = newHead;
        if (!format) { //format is false,then delete the tail
            this.tail.remove();
            this.tail = this.tail.last;
            this.pos.pop();

        }

    },
    eat: function() {
        this.strategies.move.call(this, true);
        createFood();
        game.score++;
    },
    die: function() {
        console.log('die');
        console.log(this);
        game.over();
    }
}

snake = new Snake();


function createFood() {
    var x = null;
    var y = null;

    var include = true; //ture 表示事物的坐标在蛇身上，需要进行循环
    while (include) {
        x = Math.round(Math.random() * (td - 1));
        y = Math.round(Math.random() * (tr - 1));
        snake.pos.forEach(function(value) {
            if (value[0] != x && y != value[1]) {
                include = false;
            }
        })
    }

    //生成食物
    food = new Square(x, y, 'food');
    food.pos = [x, y];
    var foodDom = document.querySelector('.food');
    if (foodDom) {
        foodDom.style.left = x * sw + 'px';
        foodDom.style.top = y * sh + 'px';
    } else {
        food.create();
    }
    // food.create();
}



//游戏构造逻辑

function Game() {
    this.timeer = null;
    this.score = 0;
}

Game.prototype.init = function() {
    snake.init();
    //snake.getNextPos();
    createFood();

    document.onkeydown = function(ev) {
        if (ev.which == 37 && snake.direction != snake.directionNum.right) {
            snake.direction = snake.directionNum.left;
        } else if (ev.which == 38 && snake.direction != snake.directionNum.down) {
            snake.direction = snake.directionNum.up;
        } else if (ev.which == 39 && snake.direction != snake.directionNum.left) {
            snake.direction = snake.directionNum.right;
        } else if (ev.which == 40 && snake.direction != snake.directionNum.up) {
            snake.direction = snake.directionNum.down;
        }
    }

    this.start();
}

Game.prototype.start = function() {
    this.timer = setInterval(function() {
        snake.getNextPos();
    }, 100);
}

Game.prototype.pause = function() {
    clearInterval(this.timer);
}


Game.prototype.over = function() {
    clearInterval(this.timer);
    alert('你的得分为： ' + this.score);

    var snakeWrap = document.getElementById('snakeWrap');
    snakeWrap.innerHTML = '';
    snake = new Snake();
    game = new Game();

    var startBtnWrap = document.querySelector('.startBtn');
    startBtnWrap.style.display = 'block';
}

game = new Game();
var startBtn = document.querySelector('.startBtn button');
startBtn.onclick = function() {
    startBtn.parentElement.style.display = 'none';
    game.init();
}

//暂停

var snakeWrap = document.getElementById('snakeWrap');
var pauseBtn = document.querySelector('.pauseBtn button');
snakeWrap.onclick = function() {
    game.pause();

    pauseBtn.parentNode.style.display = 'block';
}
pauseBtn.onclick = function() {
    game.start();
    pauseBtn.parentNode.style.display = 'none';
}