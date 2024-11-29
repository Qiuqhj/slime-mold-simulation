let molds = []; 
let num = 4000;  // 初始变形菌的数量
let d; 
let speedSlider, numSlider, sizeSlider;
let colorButton;
let moldColor;

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);
  d = pixelDensity();
  
  // 初始化变形菌
  for (let i = 0; i < num; i++) {
    molds[i] = new Mold();
  }
  
  // 滑块：控制变形菌数量
  numSlider = createSlider(100, 10000, num, 100);
  numSlider.position(20, height - 90);
  numSlider.style('width', '200px');
  let numLabel = createDiv('Mold Count');
  numLabel.position(20, height - 120);
  numLabel.style('color', 'white');  // 设置标签字体颜色为白色
  
  // 滑块：控制变形菌的速度
  speedSlider = createSlider(1, 10, 3, 0.1);  // 设置速度范围与精度
  speedSlider.position(240, height - 90);
  speedSlider.style('width', '200px');
  let speedLabel = createDiv('Mold Speed');
  speedLabel.position(240, height - 120);
  speedLabel.style('color', 'white');  // 设置标签字体颜色为白色
  
  // 滑块：控制变形菌大小
  sizeSlider = createSlider(1, 10, 2, 1);
  sizeSlider.position(460, height - 90);
  sizeSlider.style('width', '200px');
  let sizeLabel = createDiv('Mold Size');
  sizeLabel.position(460, height - 120);
  sizeLabel.style('color', 'white');  // 设置标签字体颜色为白色
  
  // 按钮：控制变形菌颜色
  colorButton = createButton('Change Mold Color');
  colorButton.position(680, height - 90);
  colorButton.mousePressed(changeColor);
  
  let colorLabel = createDiv('Change Mold Color');
  colorLabel.position(680, height - 120);
  colorLabel.style('color', 'white');  // 设置按钮标签字体颜色为白色
  
  moldColor = color(255);  // 初始变形菌颜色为白色
  
  describe('This sketch simulates behaviors of slime molds. Each slime mold object has position (x and y), traveling direction (r and heading angle) and sensor (in 3 directions: front, left, and forward). As a slime mold moves through the trail, it leaves a trace and the trail map is updated. In each simulation step, a slime mold senses the trail map (the pixel color value) and decides which direction to move and rotate.', LABEL);
}

function draw() {
  background(0, 5);  // 每次刷新背景
  loadPixels();  // 更新像素数据
  
  // 根据滑块值动态调整变形菌的数量
  num = numSlider.value();
  
  // 根据滑块值动态调整变形菌的大小
  let size = sizeSlider.value();
  
  // 根据滑块值动态调整变形菌的速度
  let speed = speedSlider.value();
  
  // 更新和显示所有的变形菌
  for (let i = 0; i < num; i++) {
    if (i >= molds.length) {
      molds.push(new Mold());  // 添加新的变形菌
    }
    molds[i].r = size;  // 设置每个变形菌的大小
    molds[i].speed = speed;  // 设置每个变形菌的移动速度
    molds[i].update();
    molds[i].display();
  }
}

// 变形菌类
class Mold {
  constructor() {
    // 初始化变形菌的位置
    this.x = random(width / 2 - 20, width / 2 + 20);
    this.y = random(height / 2 - 20, height / 2 + 20);
    this.r = 0.5;
    this.speed = 3;  // 默认速度为 3
    
    this.heading = random(360);  // 初始朝向
    this.vx = cos(this.heading);
    this.vy = sin(this.heading);
    this.rotAngle = 45;  // 初始旋转角度
    
    // 传感器设置
    this.rSensorPos = createVector(0, 0);
    this.lSensorPos = createVector(0, 0);
    this.fSensorPos = createVector(0, 0);
    this.sensorAngle = 45;
    this.sensorDist = 10;
  }
  
  update() {
    this.vx = cos(this.heading);
    this.vy = sin(this.heading);
    
    // 使用滑块值来控制变形菌的速度，速度影响每一帧的移动距离
    this.x += this.vx * this.speed;
    this.y += this.vy * this.speed;
    
    // 使用 % 运算符来实现画布的环绕
    this.x = (this.x + width) % width;
    this.y = (this.y + height) % height;
    
    // 获取三个传感器的位置
    this.getSensorPos(this.rSensorPos, this.heading + this.sensorAngle);
    this.getSensorPos(this.lSensorPos, this.heading - this.sensorAngle);
    this.getSensorPos(this.fSensorPos, this.heading);
  
    // 获取传感器位置的像素值并进行比较
    let index, l, r, f;
    index = 4 * (d * floor(this.rSensorPos.y)) * (d * width) + 4 * (d * floor(this.rSensorPos.x));
    r = pixels[index];
    
    index = 4 * (d * floor(this.lSensorPos.y)) * (d * width) + 4 * (d * floor(this.lSensorPos.x));
    l = pixels[index];
    
    index = 4 * (d * floor(this.fSensorPos.y)) * (d * width) + 4 * (d * floor(this.fSensorPos.x));
    f = pixels[index];
    
    // 根据传感器数据来调整移动方向
    if (f > l && f > r) {
      this.heading += 0;  // 前方感应最强，保持当前方向
    } else if (f < l && f < r) {
      if (random(1) < 0.5) {
        this.heading += this.rotAngle;  // 向右旋转
      } else {
        this.heading -= this.rotAngle;  // 向左旋转
      }
    } else if (l > r) {
      this.heading += -this.rotAngle;  // 向左旋转
    } else if (r > l) {
      this.heading += this.rotAngle;  // 向右旋转
    }
  }
  
  display() {
    noStroke();
    fill(moldColor);  // 使用当前颜色填充变形菌
    ellipse(this.x, this.y, this.r * 2, this.r * 2);  // 绘制变形菌
  }
  
  getSensorPos(sensor, angle) {
    sensor.x = (this.x + this.sensorDist * cos(angle) + width) % width;
    sensor.y = (this.y + this.sensorDist * sin(angle) + height) % height;
  }
}

// 改变变形菌颜色
function changeColor() {
  moldColor = color(random(255), random(255), random(255));  // 随机生成一种颜色
}
