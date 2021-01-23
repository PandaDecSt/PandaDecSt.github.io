const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const gameImagedata = ctx.createImageData(canvas.width, canvas.height);
const gameImagedata32 = new Uint32Array(gameImagedata.data.buffer);

function init() {
    ctx.translate(0.5, 0.5);
}

//构造对象方块
function Rect(x, y, w, h, color) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.color = color;
}
//画方块的方法
Rect.prototype.draw = function() {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.rect(this.x, this.y, this.w, this.h);
    ctx.fill();
    ctx.stroke();
}

//构造对象蛇
function Snake() {

    //定义一个空数组存放组成整蛇的方块对象
    var snakeArray = [];

    //画出4个方块，设置成灰色
    for (var i = 0; i < 4; i++)
    {
        var rect = new Rect(i * 5, 0, 5, 5, "blue");
        //之所以用splice（往前加）而不是用push（往后加），是为了让蛇头出现在数组第一个位置
        snakeArray.splice(0, 0, rect);
    }

    //把数组第一个作为蛇头，蛇头设成红色
    var head = snakeArray[0];
    head.color = "red";

    //此处将两个后面常用的东西定为属性，方便后面调用
    this.head = snakeArray[0]; //蛇头
    this.snakeArray = snakeArray; //整蛇数组

    //给定初始位置向右(同keyCode右箭头)
    this.direction = 39;
}
//画蛇的方法
Snake.prototype.draw = function() {
    for (var i = 0; i < this.snakeArray.length; i++)
    {
        this.snakeArray[i].draw();
    }
}
//蛇移动的方法
Snake.prototype.move = function() {

    //此处是核心部分，蛇的 移动方式
    //1、画一个灰色的方块，位置与蛇头重叠
    //2、将这个方块插到数组中蛇头后面一个的位置
    //3、砍去末尾的方块
    //4、将蛇头向设定方向移动一格
    var rect = new Rect(this.head.x, this.head.y, this.head.w, this.head.h, "blue");
    this.snakeArray.splice(1, 0, rect);

    //判断是否吃到食物，isEat判定函数写在最后了
    //吃到则食物重新给位置，不砍去最后一节，即蛇变长
    //没吃到则末尾砍掉一节，即蛇长度不变
    if (isEat())
    {
        food = new getRandomFood();
    }
    else
    {
        this.snakeArray.pop();
    }
    
    //设置蛇头的运动方向，37 左，38 上，39 右，40 下
    switch (this.direction)
    {
        case 37:
            this.head.x -= this.head.w
            break;
        case 38:
            this.head.y -= this.head.h
            break;
        case 39:
            this.head.x += this.head.w
            break;
        case 40:
            this.head.y += this.head.h
            break;
        default:
            break;
    }

    // gameover判定
    // 撞墙
    if (this.head.x >= canvas.width || this.head.x < 0 || this.head.y >= canvas.height || this.head.y < 0)
    {
        clearInterval(timer);
    }

    // 撞自己，循环从1开始，避开蛇头与蛇头比较的情况
    for (var i = 1; i < this.snakeArray.length; i++)
    {
        if (this.snakeArray[i].x == this.head.x && this.snakeArray[i].y == this.head.y)
        {
            clearInterval(timer);
        }
    }
}

//画出初始的蛇
var snake = new Snake()
snake.draw();

//画出初始的食物
var food = new getRandomFood()

//定时器
var timer = setInterval(function() {
                            ctx.clearRect(0, 0, canvas.width, canvas.height);
                            food.draw();
                            snake.move();
                            snake.draw();
                        }, 100)

//键盘事件，其中的if判定是为了让蛇不能直接掉头
document.onkeydown = function(e) {
    var ev = e || window.event;
    checkd(ev.keyCode);
    ev.preventDefault();
}

function checkd(key){
    switch (key)
    {
        case 37:
            {
                if (snake.direction !== 39)
                {
                    snake.direction = 37;
                }
                break;
            }
        case 38:
            {
                if (snake.direction !== 40)
                {
                    snake.direction = 38;
                }
                break;
            }
        case 39:
            {
                if (snake.direction !== 37)
                {
                    snake.direction = 39;
                }
                break;
            }
        case 40:
            {
                if (snake.direction !== 38)
                {
                    snake.direction = 40;
                }
                break;
            }
    }
}

//随机函数，获得[min,max]范围的值
function getNumberInRange(min, max) {
    var range = max - min;
    var r = Math.random();
    return Math.round(r * range + min)
}

//构建食物对象
function getRandomFood() {

    //判定食物是否出现在蛇身上，如果是重合，则重新生成一遍
    var isOnSnake = true;

    //设置食物出现的随机位置
    while (isOnSnake)
    {
        //执行后先将判定条件设置为false，如果判定不重合，则不会再执行下列语句
        isOnSnake = false;
        var indexX = getNumberInRange(0, canvas.width / 20 - 1);
        var indexY = getNumberInRange(0, canvas.height / 20 - 1);
        var rect = new Rect(indexX * 5, indexY * 5, 5, 5, "black");
        for (var i = 0; i < snake.snakeArray.length; i++)
        {
            if (snake.snakeArray[i].x == rect.x && snake.snakeArray[i].y == rect.y)
            {
                //如果判定重合，将其设置为true，使随机数重给
                isOnSnake = true;
                break;
            }
        }
    }
    //返回rect，使得实例化对象food有draw的方法
    return rect;
}

//判定吃到食物，即蛇头坐标与食物坐标重合
function isEat() {
    if (snake.head.x == food.x && snake.head.y == food.y)
    {
        return true;
    }
    else
    {
        return false;
    }
}

document.getElementById("up").click()(function () {
                                          checkd(38);
                                      });
document.getElementById("down").click()(function () {
                                          checkd(40);
                                      });
document.getElementById("right").click()(function () {
                                          checkd(39);
                                      });
document.getElementById("left").click()(function () {
                                          checkd(37);
                                      });

window.onload = function () {
    init();
};
