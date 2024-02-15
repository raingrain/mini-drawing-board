import "./style.css";

// canvas对象
const canvas = document.querySelector("canvas") as HTMLCanvasElement;
// 设置为2d
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
// 绘制不同的形状 + 画笔 + 清除按钮
const toolButtons = document.querySelectorAll(".tool") as any as HTMLLIElement[];
// 是否以填充形式绘制
const fillColor = document.querySelector("#fill-color") as HTMLInputElement;
// 线条的尺寸
const sizeSlider = document.querySelector("#size-slider") as HTMLInputElement;
// 颜色选择按钮
const colorButtons = document.querySelectorAll(".colors .option") as any as HTMLLIElement[];
// 颜色选择器按钮
const colorPicker = document.querySelector("#color-picker") as HTMLInputElement;
// 清除画布按钮
const clearCanvas = document.querySelector(".clear-canvas") as HTMLButtonElement;
// 保存为图像按钮
const saveImg = document.querySelector(".save-img") as HTMLButtonElement;

// 按下鼠标时鼠标的位置
let prevMouseX: number, prevMouseY: number;
// 存储画布数据的快照
let snapshot: ImageData;
// 是否开启绘制
let isDrawing = false;
// 默认选择的工具
let selectedTool = "brush";
// 笔刷/线条宽度
let brushWidth = 5;
// 选择的颜色
let selectedColor = "#000";

// 给一张空画布添加一张白色背景
const setCanvasBackground = () => {
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // 添加后记得把画笔的颜色改成之前选中的
    ctx.fillStyle = selectedColor;
};

window.addEventListener("load", () => {
    // 把canvas的宽高从默认(300, 150)修改为容器宽高
    // 否则会出现鼠标位置与画出图形位置不对应的bug
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    // 设置一个白色背景
    setCanvasBackground();
});

// 绘制矩形
const drawRect = (e: MouseEvent) => {
    // 根据填充按钮是否被选中来控制绘制描边矩形还是填充矩形
    if (!fillColor.checked) {
        return ctx.strokeRect(e.offsetX, e.offsetY, prevMouseX - e.offsetX, prevMouseY - e.offsetY);
    }
    ctx.fillRect(e.offsetX, e.offsetY, prevMouseX - e.offsetX, prevMouseY - e.offsetY);
};

// 绘制圆形
const drawCircle = (e: MouseEvent) => {
    ctx.beginPath();
    // 鼠标初始位置与当前位置之间的直线距离作为半径
    let radius = Math.sqrt(Math.pow((prevMouseX - e.offsetX), 2) + Math.pow((prevMouseY - e.offsetY), 2));
    ctx.arc(prevMouseX, prevMouseY, radius, 0, 2 * Math.PI);
    // 根据填充按钮是否被选中来控制绘制描边圆形还是填充圆形
    fillColor.checked ? ctx.fill() : ctx.stroke();
};

// 三角形绘制函数
const drawTriangle = (e: MouseEvent) => {
    ctx.beginPath();
    // 绘制顶点
    ctx.moveTo(prevMouseX, prevMouseY);
    // 顶点到底边一个点
    ctx.lineTo(e.offsetX, e.offsetY);
    // 绘制等腰三角形，获取底边的另外一个对称点
    ctx.lineTo(prevMouseX * 2 - e.offsetX, e.offsetY);
    // 三角形需要闭合，也可以使用lineTo回到原点
    ctx.closePath();
    // 看看是否需要填充
    fillColor.checked ? ctx.fill() : ctx.stroke();
};

// 开始绘制函数
const startDraw = (e: MouseEvent) => {
    isDrawing = true;
    // 获取鼠标初始位置
    prevMouseX = e.offsetX;
    prevMouseY = e.offsetY;
    // 每次绘制都开始一条新路径
    ctx.beginPath();
    ctx.lineWidth = brushWidth;
    ctx.strokeStyle = selectedColor;
    ctx.fillStyle = selectedColor;
    // 将之前的绘制数据拷贝并存入到一个快照变量中
    snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
};

// 绘制中函数
const drawing = (e: MouseEvent) => {
    // 如果不在绘制状态就返回
    if (!isDrawing) return;
    // 将快照（之前的绘制数据）打印在画布上
    ctx.putImageData(snapshot, 0, 0);
    // 根据选择进行绘制
    if (selectedTool === "brush" || selectedTool === "eraser") {
        // 选择橡皮擦就把线条颜色改成白色即可
        ctx.strokeStyle = selectedTool === "eraser" ? "#fff" : selectedColor;
        ctx.lineTo(e.offsetX, e.offsetY); // creating line according to the mouse pointer
        ctx.stroke(); // drawing/filling line with color
    } else if (selectedTool === "rectangle") {
        drawRect(e);
    } else if (selectedTool === "circle") {
        drawCircle(e);
    } else {
        drawTriangle(e);
    }
};

// 结束绘制
function endDraw() {
    isDrawing = false;
}

// 工具选中时赋予样式并清除之前的
toolButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelector(".options .active")?.classList.remove("active");
        btn.classList.add("active");
        selectedTool = btn.id;
    });
});

// 绘制时线宽度由range输入框决定
sizeSlider.addEventListener("change", () => brushWidth = Number(sizeSlider.value));

// 切换选择的颜色
colorButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        // 清除选择样式
        document.querySelector(".options .selected")?.classList.remove("selected");
        // 给当前按钮添加样式
        btn.classList.add("selected");
        // 从window上获取选中对象的颜色
        selectedColor = window.getComputedStyle(btn).getPropertyValue("background-color");
    });
});

// 针对于最后一个颜色选择器的函数
colorPicker.addEventListener("change", () => {
    colorPicker.parentElement!.style.background = colorPicker.value;
    colorPicker.parentElement?.click();
});

// 清除画布
clearCanvas.addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setCanvasBackground();
});

// 保存图片，直接利用a标签的下载属性来进行
saveImg.addEventListener("click", () => {
    // 先创建a标签
    const link = document.createElement("a");
    // 以日期来命名下载的文件
    link.download = `${Date.now()}.jpg`;
    // 下载链接就是图片的地址
    link.href = canvas.toDataURL();
    // 点击下载
    link.click();
});

// 鼠标按下移动抬起的一个过程就是绘制过程
// 开始绘制
canvas.addEventListener("mousedown", startDraw);
// 绘制中
canvas.addEventListener("mousemove", drawing);
// 结束绘制函数
canvas.addEventListener("mouseup", endDraw);