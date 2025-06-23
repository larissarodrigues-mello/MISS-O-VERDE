// ==================== VARIÁVEIS ====================
let player = { x: 400, y: 350, movingLeft: false, movingRight: false, speed: 4 };
let seeds = 4;
let points = 0;
let pollution = 100;
let gameState = 'intro';

let trees = [];
let messages = '';
let movedLeft = false;
let movedRight = false;

let introAlpha = 255;
let introTimer = 0;

let storeOpen = false;
let messageTimer = 0;

// ==================== SETUP ====================
function setup() {
  createCanvas(800, 400);
  textAlign(CENTER, CENTER);
  rectMode(CENTER);
  textFont('Arial');
}

// ==================== DRAW ====================
function draw() {
  background(255);

  if (gameState === 'intro') {
    drawIntro();
  } else if (gameState === 'start') {
    drawStartScreen();
  } else if (gameState === 'playing') {
    drawGame();
  } else if (gameState === 'store') {
    drawGame();
    drawStore();
  } else if (gameState === 'win') {
    drawWinScreen();
  }
}

// ==================== INTRO ====================
function drawIntro() {
  background(173, 216, 230);

  fill(0, 0, 0, introAlpha);
  textSize(20);
  text(
    "Você é um pequeno cidadão de uma cidade extremamente poluída,\nplante o máximo de árvores que conseguir para reduzir a poluição",
    width / 2,
    height / 2
  );

  introTimer++;
  if (introTimer > 60 * 7) {
    introAlpha -= 5;
    if (introAlpha <= 0) {
      introAlpha = 0;
      gameState = 'start';
    }
  }
}

// ==================== TELA INICIAL ====================
function drawStartScreen() {
  background(255);
  fill(107, 142, 35);
  textSize(36);
  text('MISSÃO VERDE', width / 2, height / 2 - 60);

  drawTreeShape(width / 2 + 150, height / 2 - 65, 40, 60);

  fill(0, 150, 0);
  rect(width / 2, height / 2 + 40, 140, 50, 12);

  fill(0);
  textSize(28);
  text('JOGAR', width / 2, height / 2 + 40);
}

// ==================== JOGO PRINCIPAL ====================
function drawGame() {
  let skyProgress = (100 - pollution) / 100;
  background(lerpColor(color(128, 128, 128), color(135, 206, 235), skyProgress));

  drawClouds();
  drawGround();
  drawPlayer();
  drawTrees();
  drawUI();
  drawMessages();

  updatePlayer();
  updateTrees();

  handleMessages();
}

// ==================== NUVENS ====================
function drawClouds() {
  let cloudGray = map(pollution, 100, 0, 80, 255);
  fill(cloudGray);
  noStroke();
  for (let i = 0; i < 5; i++) {
    let x = (i * 160 + frameCount / 2) % width;
    ellipse(x, 60, 80, 40);
    ellipse(x + 30, 60, 60, 30);
  }
}

// ==================== CHÃO ====================
function drawGround() {
  fill(34, 139, 34);
  rect(width / 2, height - 25, width, 50);
}

// ==================== PERSONAGEM ====================
function drawPlayer() {
  fill(255, 0, 0);
  noStroke();
  triangle(player.x, player.y, player.x - 15, player.y + 25, player.x + 15, player.y + 25);
}

// ==================== ÁRVORES ====================
function drawTrees() {
  for (let t of trees) {
    if (t.state === 'seedling') {
      drawSeedling(t.x, height - 50);
    } else if (t.state === 'grown') {
      drawTree(t.x, height - 80);
    }
  }
}

function drawSeedling(x, y) {
  stroke(144, 238, 144);
  strokeWeight(3);
  line(x, y, x, y - 15);
  noStroke();
  fill(144, 238, 144);
  ellipse(x, y - 20, 15, 15);
}

function drawTree(x, y) {
  fill(101, 67, 33);
  rect(x, y + 30, 10, 30);
  fill(0, 100, 0);
  triangle(x - 25, y + 30, x, y - 40, x + 25, y + 30);
}

function drawTreeShape(x, y, w, h) {
  fill(101, 67, 33);
  rect(x, y + h / 3, w / 4, h / 2);
  fill(0, 100, 0);
  triangle(x - w / 2, y + h / 2, x, y - h / 1.5, x + w / 2, y + h / 2);
}

// ==================== INTERFACE ====================
function drawUI() {
  fill(0, 0, 0, 150);
  rect(70, height - 40, 120, 35, 7);

  fill(255, 255, 0);
  noStroke();
  let baseX = 30;
  for (let i = 0; i < 3; i++) {
    ellipse(baseX + i * 15, height - 40, 10, 10);
  }
  fill(0);
  textSize(16);
  textAlign(LEFT, CENTER);
  text('x ' + seeds, 70, height - 40);

  fill(255, 165, 0);
  rect(width - 80, 30, 80, 30, 7);
  fill(0);
  textSize(18);
  textAlign(CENTER, CENTER);
  text(points + ' pts', width - 80, 30);

  fill(255);
  rect(width / 2, 30, 210, 20, 7);

  let barColor = color(255, 0, 0);
  if (pollution <= 50 && pollution > 20) barColor = color(255, 255, 0);
  else if (pollution <= 20) barColor = color(144, 238, 144);

  fill(barColor);
  rectMode(CENTER);
  rect(width / 2 - 105 + (pollution * 2) / 2, 30, pollution * 2, 20, 7);
  rectMode(CENTER);

  fill(0);
  textSize(16);
  textAlign(CENTER, CENTER);
  text('Poluição ' + floor(pollution) + '%', width / 2, 55);
}

function drawMessages() {
  fill(255, 0, 0);
  textSize(16);
  textAlign(LEFT, CENTER);
  text(messages, 160, height - 100);
}

// ==================== ATUALIZAÇÃO ====================
function updateTrees() {
  let now = millis();
  for (let t of trees) {
    if (t.state === 'seedling' && t.watered && now - t.growTimer >= 5000) {
      t.state = 'grown';
      t.pointTimer = now;
      points += 10;
      pollution -= 5;
      if (pollution < 0) pollution = 0;
      if (pollution === 0) gameState = 'win';
    }
  }
}

function updatePlayer() {
  if (player.movingLeft) player.x -= player.speed;
  if (player.movingRight) player.x += player.speed;
  player.x = constrain(player.x, 15, width - 15);
}

// ==================== MENSAGENS ====================
function handleMessages() {
  if (!movedLeft || !movedRight) {
    messages = 'Use A e D para se mover';
  } else if (trees.length === 0) {
    messages = 'Pressione E para plantar sua semente';
  } else {
    let hasSeedling = trees.some(t => t.state === 'seedling' && !t.watered);
    if (hasSeedling) {
      messages = 'Pressione P para regar a muda';
    } else if (seeds === 0 && !storeOpen) {
      messages = 'Pressione Y para abrir a loja';
    } else {
      messages = '';
    }
  }
}

// ==================== INPUT ====================
function mousePressed() {
  if (gameState === 'start') {
    if (
      mouseX > width / 2 - 70 &&
      mouseX < width / 2 + 70 &&
      mouseY > height / 2 + 15 &&
      mouseY < height / 2 + 65
    ) {
      gameState = 'playing';
    }
  } else if (gameState === 'store') {
    let triX = width / 2;
    let triY = height / 2 + 40;
    if (
      mouseX > triX - 20 &&
      mouseX < triX + 20 &&
      mouseY > triY - 15 &&
      mouseY < triY + 15
    ) {
      if (points >= 5) {
        points -= 5;
        seeds += 2;
        messages = 'Sementes compradas!';
      } else {
        messages = 'Você não tem pontos suficientes!';
      }
    }
    let closeX = width / 2 + 65;
    let closeY = height / 2 - 65;
    if (
      mouseX > closeX - 15 &&
      mouseX < closeX + 15 &&
      mouseY > closeY - 15 &&
      mouseY < closeY + 15
    ) {
      gameState = 'playing';
      storeOpen = false;
    }
  }
}

function keyPressed() {
  if (key === 'a' || key === 'A') {
    player.movingLeft = true;
    movedLeft = true;
  }
  if (key === 'd' || key === 'D') {
    player.movingRight = true;
    movedRight = true;
  }
  if (key === 'e' || key === 'E') plantSeed();
  if (key === 'p' || key === 'P') waterTree();
  if (key === 'y' || key === 'Y' && seeds === 0) {
    gameState = 'store';
    storeOpen = true;
  }
}

function keyReleased() {
  if (key === 'a' || key === 'A') player.movingLeft = false;
  if (key === 'd' || key === 'D') player.movingRight = false;
}

// ==================== AÇÕES ====================
function plantSeed() {
  if (seeds > 0) {
    trees.push({
      x: player.x,
      state: 'seedling',
      watered: false,
      growTimer: 0,
      pointTimer: 0,
    });
    seeds--;
  } else {
    messages = 'Sem sementes!';
  }
}

function waterTree() {
  let nearest = null;
  let minDist = 9999;
  for (let t of trees) {
    if (t.state === 'seedling') {
      let distX = abs(t.x - player.x);
      if (distX < 30 && distX < minDist) {
        nearest = t;
        minDist = distX;
      }
    }
  }
  if (nearest) {
    if (!nearest.watered) {
      nearest.watered = true;
      nearest.growTimer = millis();
    } else {
      messages = 'Esta muda já foi regada!';
    }
  } else {
    messages = 'Nenhuma muda próxima para regar!';
  }
}

// ==================== LOJA ====================
function drawStore() {
  fill(0, 0, 0, 180);
  rect(width / 2, height / 2, width, height);

  fill(255);
  rect(width / 2, height / 2, 150, 150, 15);

  fill(255, 255, 0);
  noStroke();
  for (let i = 0; i < 3; i++) {
    ellipse(width / 2 - 20 + i * 15, height / 2 - 20, 10, 10);
  }

  fill(0, 200, 0);
  triangle(width / 2 - 20, height / 2 + 40, width / 2 + 20, height / 2 + 40, width / 2, height / 2 + 10);

  fill(0);
  textSize(16);
  text('5 pontos', width / 2 - 30, height / 2 + 60);

  fill(255, 0, 0);
  textSize(32);
  text('X', width / 2 + 65, height / 2 - 65);
}

// ==================== VITÓRIA ====================
function drawWinScreen() {
  background(173, 216, 230);
  fill(0);
  textSize(26);
  textAlign(CENTER, CENTER);
  text('Parabéns, você concluiu seu objetivo!\nO ar está bem mais fresco agora.', width / 2, height / 2 - 20);
}



