var treeArr = []; // 树形结构的 存储数组
var levelNum = 0; // 树形结构含有多少层级
var domArr; // dom 结构数组 用于方便生成 树形 dom结构

// 三种遍历 得到的结果 存放于三个数组中
var pre_order_traversal_arr = [];
var middle_order_traversal_arr = [];
var post_order_traversal_arr = [];

var btn = document.getElementsByTagName('button')[0];
var input = document.getElementsByTagName('input')[0];
var display = document.getElementById('display');
var pre_order_traversal = document.getElementById('pre-order-traversal');
var middle_order_traversal = document.getElementById('middle-order-traversal');
var post_order_traversal = document.getElementById('post-order-traversal');
var answer = document.getElementById('answer');

// 初始化domArr
function initDomArr(node) {
    domArr = new Array(7);
    for (var i = 0; i < 7; i++) {
        domArr[i] = new Array(2 ** i);
        var len = domArr[i].length;
        for (var j = 0; j < len; j++) {
            domArr[i][j] = '<div class="node level' + i + '"></div>';
        }
    }
}

//  节点构造函数
function Node(data, left, right, level, floorIndex) {
    this.data = data;
    this.left = left;
    this.right = right;
    this.level = level;
    this.floorIndex = floorIndex;
    // floorIndex 用于获知该节点位于 同一层级上的 第几个位置（从左往右）
}

// 递归 构造树形结构
function buildTree(arr, x, y) {
    var c1 = -1,
        c2 = -1,
        flag = 0,
        u;

    // 如果只有一个节点，可以看出，这个节点必定是数字节点，那么左右置为空
    if (y - x == 1) {
        var temp = new Node(arr[x], null, null);
        treeArr.push(temp);
        return temp;
    }

    // 循环遍历数据数组 找出最后一次计算（逻辑上）的 运算符号
    for (var i = x; i < y; i++) {
        switch (arr[i]) {
            case '(':
                flag++;
                break;
            case ')':
                flag--;
                break;
            case '+':
            case '-':
                if (!flag)
                    c1 = i;
                break;
            case '*':
            case '/':
                if (!flag)
                    c2 = i;
                break;
            default:
                break;
        }
    }

    // 如果最后一次运算符号不是加、减号  那么最后一次符号（可能）是 乘、除号
    if (c1 < 0) {
        c1 = c2;
    }

    // 当c1，c2都未改变时，说明为括号
    if (c1 < 0) {
        // 括号就左右往里递归
        return buildTree(arr, x + 1, y - 1);
    }

    var tempObj = new Node(arr[c1], null, null);
    treeArr.push(tempObj);
    tempObj.left = buildTree(arr, x, c1);
    tempObj.right = buildTree(arr, c1 + 1, y);

    // 如果不 return 会报错 因为函数没有返回值就赋值给 对象是 不行的
    return tempObj;
}

// 递归 填充每个节点所在的层级  以及每个节点在同一层级的 第几个位置
function initLevel(node, num, index) {

    // 递归出口
    if (!node) {
        return;
    }

    domArr[num][index - 1] = '<div class="node level' + num + '">' + node.data + '</div>';
    node.floorIndex = index;
    node.level = num;
    initLevel(node.left, num + 1, index * 2 - 1);
    initLevel(node.right, num + 1, index * 2);
}

// 递归 前序遍历
function preOrderTraversal(node) {
    if (node) {
        pre_order_traversal_arr.push(node.data);
        preOrderTraversal(node.left);
        preOrderTraversal(node.right);
    } else {
        return;
    }
}

// 递归 中序遍历
function middleOrderTraversal(node) {
    if (node) {
        middleOrderTraversal(node.left);
        middle_order_traversal_arr.push(node.data);
        middleOrderTraversal(node.right);
    } else {
        return;
    }
}

// 递归 后序遍历
function postOrderTraversal(node) {
    if (node) {
        postOrderTraversal(node.left);
        postOrderTraversal(node.right);
        post_order_traversal_arr.push(node.data);
    }
}

// 生成前、中、后 序 遍历结果的 dom结构
function traversalAnswer(arr, div, str) {
    div.innerHTML = '';
    arr.forEach(function(value) {
        str = str + " " + value;
    });
    div.innerHTML = str;
}

// 生成 dom 结构
function createDom() {
    // 每个 节点 为其添加 level 属性 和 floorIndex 属性
    initLevel(treeArr[0], 0, 1);
    levelNum = 0;
    treeArr.forEach(function(value) {
        if (value.level > levelNum) {
            levelNum = value.level;
        }
    });
    // 计算 有多少层
    var str = '';
    for (var i = 0; i <= levelNum; i++) {
        var floorNodeNum = 2 ** i;
        for (var j = 0; j < floorNodeNum; j++) {
            str += domArr[i][j];
        }
    }
    display.innerHTML = str;
    traversalAnswer(pre_order_traversal_arr, pre_order_traversal, '前序遍历输出结果为： ');
    traversalAnswer(middle_order_traversal_arr, middle_order_traversal, '中序遍历输出结果为： ');
    traversalAnswer(post_order_traversal_arr, post_order_traversal, '后序遍历输出结果为： ');
    answer.innerHTML = '算数表达式的答案为 ： ' + getAnswer();
}

// 获取 表达式的计算结果
// 思路 结合逆波兰表达式 和 栈的思想   
function getAnswer() {
    // 栈思想 按位存放逆波兰表达式，遇到符号，进行计算，计算结果重新压入栈中
    var stack = [];
    post_order_traversal_arr.forEach(function(value) {
        if (typeof(value) == 'number') {
            stack.push(value);
        } else {
            var temp;
            switch (value) {
                case '+':
                    temp = stack.pop() + stack.pop();
                    break;
                case '-':
                    var num1 = stack.pop();
                    var num2 = stack.pop();
                    temp = num2 - num1;
                    break;
                case '*':
                    temp = stack.pop() * stack.pop();
                    break;
                case '/':
                    var num1 = stack.pop();
                    var num2 = stack.pop();
                    temp = num2 / num1;
                    break;
                default:
                    break;
            }
            stack.push(temp);
        }
    });
    return stack.pop();
}

// 点击生成按钮 的操作
btn.onclick = function() {
    initDomArr();
    var temp = input.value.split("");
    var arr = [];
    var t = '';
    temp.forEach(function(value) {
        if ((value >= '0' && value <= '9') || value == '.') {
            t += value;
        } else {
            if (t) {
                arr.push(Number(t));
                t = '';
            }
            arr.push(value);

        }
    });
    if (t) {
        arr.push(Number(t));
    }

    // 获取 输入框的数据 数组

    // 重置 treeArr
    treeArr = [];
    buildTree(arr, 0, arr.length); // 构建树形结构

    // 每次点击 重置遍历结果
    pre_order_traversal_arr = [];
    middle_order_traversal_arr = [];
    post_order_traversal_arr = [];

    preOrderTraversal(treeArr[0]);
    middleOrderTraversal(treeArr[0]);
    postOrderTraversal(treeArr[0]);
    createDom();
}