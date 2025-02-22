function startGame(name) {
  clearInterval(countdown);
  playerName = name;
  hp = 3;
  hint = 1;
  stage = 1;
  memorizePhase = true;
  scoreSaved = false;
  gameOver = false;
  paused = false;
  isHint = false;
  btnSaveScore.disabled = false;

  timer = memorizeTime;
  startPos = {
    x: 0,
    y: random(),
  };

  goalPos = {
    x: gridSize - 1,
    y: random(),
  };

  playerPos = { ...startPos };

  generateWalls();
  renderMaze();
  startTimer();

  modalPause.classList.add("none");
  modalGameOver.classList.add("none");

  stageDsp.textContent = `Stage ${stage}`;
  hpDsp.textContent = `${hp} hp`;
  nameDsp.textContent = `${playerName}`;
  phaseDsp.textContent = `Memorizing time`;
  timerDsp.textContent = `${timer}s`;
  btnHint.innerHTML = `Hint <u>${hint}</u>`;
  btnHint.disabled = true;

  gameScreen.classList.remove("none");
  homeScreen.classList.add("none");
}

function nextStage() {
  nextSound.play();
  showSuccess(`Stage ${stage} success`);
  stage++;

  if (stage % 2 === 0 && curWalls < maxWalls) {
    curWalls++;
  }

  memorizePhase = true;
  scoreSaved = false;
  gameOver = false;
  paused = false;
  isHint = false;
  btnSaveScore.disabled = false;

  timer = memorizeTime;
  startPos = {
    x: 0,
    y: random(),
  };

  goalPos = {
    x: gridSize - 1,
    y: random(),
  };

  playerPos = { ...startPos };

  generateWalls();
  renderMaze();

  stageDsp.textContent = `Stage ${stage}`;
  hpDsp.textContent = `${hp} hp`;
  nameDsp.textContent = `${playerName}`;
  phaseDsp.textContent = `Memorizing time`;
  timerDsp.textContent = `${timer}s`;
  btnHint.innerHTML = `Hint <u>${hint}</u>`;
  btnHint.disabled = true;
}

function generateWalls() {
  walls = [];

  function calcPath() {
    let visited = Array.from({ length: gridSize }, () => Array(gridSize).fill(false));
    let queue = [{ ...playerPos, steps: 0 }];
    visited[playerPos.x][playerPos.y] = true;

    while (queue.length > 0) {
      let { x, y, steps } = queue.shift();

      if (x === goalPos.x && y === goalPos.y) {
        return steps;
      }

      const dirct = [
        { x: x + 1, y: y },
        { x: x - 1, y: y },
        { x: x, y: y + 1 },
        { x: x, y: y - 1 },
      ];

      for (let { x: nx, y: ny } of dirct) {
        if (nx >= 0 && ny >= 0 && nx < gridSize && ny < gridSize && !visited[nx][ny] && !walls.some((wall) => wall.x === nx && wall.y === ny)) {
          visited[nx][ny] = true;

          queue.push({ x: nx, y: ny, steps: steps + 1 });
        }
      }
    }
    return -1;
  }

  do {
    walls = [];

    while (walls.length < curWalls) {
      let x = random();
      let y = random();
      if ((x !== playerPos.x || y !== playerPos.y) && (x != goalPos.x || y !== goalPos.y)) {
        walls.push({ x, y });
      }
    }
  } while (calcPath() < Math.floor(gridSize * 1.5));
}

function renderMaze() {
  let elem = "";

  for (y = 0; y < gridSize; y++) {
    for (x = 0; x < gridSize; x++) {
      if (x === playerPos.x && y === playerPos.y) {
        elem += `<div class='cell player'></div>`;
      } else if (x === goalPos.x && y === goalPos.y) {
        elem += `<div class='cell goal'></div>`;
      } else if (walls.some((wall) => wall.x === x && wall.y === y) && (memorizePhase || isHint)) {
        elem += `<div class='cell wall'></div>`;
      } else {
        elem += `<div class='cell'></div>`;
      }
    }
  }
  maze.innerHTML = elem;
}

function startTimer() {
  countdown = setInterval(() => {
    if (gameOver || paused) return;
    timer--;
    timerDsp.textContent = `${timer}s`;

    if (timer <= 0) {
      if (memorizePhase) {
        memorizePhase = false;
        timer = moveTime;
        renderMaze();
        phaseDsp.textContent = `Lest go`;
        if (hint <= 0) {
          btnHint.disabled = true;
        } else {
          btnHint.disabled = false;
        }
      } else {
        hp--;
        hpDsp.textContent = `${hp} hp`;
        showDanger("Your time is up!");

        if (hp <= 0) {
          setGameOver();
        } else {
          playerPos = { ...startPos };
          timer = moveTime;
          renderMaze();
        }
      }
    }
  }, 1000);
}

function movePlayer(input) {
  if (gameOver || paused || memorizePhase) return;
  let { x, y } = playerPos;

  switch (input) {
    case "ArrowUp":
      y > 0 ? (y -= 1) : y;
      if (walls.some((wall) => wall.x === x && wall.y === y)) {
        wallSound.play();
      } else {
        ySound.play();
      }
      break;
    case "ArrowDown":
      y < gridSize - 1 ? (y += 1) : y;
      if (walls.some((wall) => wall.x === x && wall.y === y)) {
        wallSound.play();
      } else {
        ySound.play();
      }
      break;
    case "ArrowLeft":
      x > 0 ? (x -= 1) : x;
      if (walls.some((wall) => wall.x === x && wall.y === y)) {
        wallSound.play();
      } else {
        xSound.play();
      }
      break;
    case "ArrowRight":
      x < gridSize - 1 ? (x += 1) : x;
      if (walls.some((wall) => wall.x === x && wall.y === y)) {
        wallSound.play();
      } else {
        xSound.play();
      }
      break;
  }
  playerPos.x = x;
  playerPos.y = y;
  renderMaze();

  if (x === goalPos.x && y === goalPos.y) {
    nextStage();
  } else if (walls.some((wall) => wall.x === x && wall.y === y)) {
    hp--;
    hpDsp.textContent = `${hp} hp`;
    showDanger("You hit a wall!");

    if (hp <= 0) {
      setGameOver();
    } else {
      playerPos = { ...startPos };
      renderMaze();
    }
  }
}

function saveScore() {
  if (!scoreSaved) {
    let score = { name: playerName, score: stage };
    leaderboard.push(score);
    leaderboard.sort((a, b) => b.score - a.score);
    localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
    score = "";
    scoreSaved = true;
    btnSaveScore.disabled = true;
    showSuccess(`Score saved!`);
    btnClear.disabled = false;
  }
}

function loadScore() {
  let elem = "";
  if (leaderboard.length === 0) {
    leaderboardData.innerHTML = `
    <tr>
                          <td colspan="4">Score is empty</td>

    </tr>
    `;
  } else {
    leaderboard.forEach((item, index) => {
      elem += `
            <tr>
                <td>${index + 1}</td>
                <td>${item.name}</td>
                <td>${item.score}</td>
                <td>
                <button class='btn btn-danger' onclick='deleteItem(${index})'>delete</button>
                </td>
                </tr>
                `;
    });
    leaderboardData.innerHTML = elem;
  }
}

function useHint() {
  if (memorizePhase) return;
  if (hint > 0) {
    hint--;
    btnHint.innerHTML = `Hint <u>${hint}</u>`;

    isHint = true;
    renderMaze();

    showSuccess("Hint is being used!");
    btnHint.disabled = true;
    setTimeout(() => {
      isHint = false;
      renderMaze();
    }, 1000);
  }
}

function deleteItem(index) {
  if (confirm("Are you sure want to delete this score?") === true) {
    leaderboard.splice(index, 1);
    leaderboard.sort((a, b) => b.score - a.score);
    localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
    showSuccess("Score deleted!");
    loadScore();
  }
}

function deleteAll() {
  if (confirm("Are you sure want to delete all score?") === true) {
    leaderboard = [];
    localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
    btnClear.disabled = true;
    showSuccess("All scores are deleted!");
    loadScore();
  }
}

function setGameOver() {
  bgm.pause();
  gameOverSound.play();
  gameOver = true;
  gameOverData.innerHTML = `
        <tr>
            <td>${playerName}</td>
            <td>${stage}</td>
        </tr>
    `;
  modalGameOver.classList.remove("none");
}

function random() {
  return Math.floor(Math.random() * gridSize);
}

function showSuccess(text) {
  alertSuccess.textContent = text;
  alertSuccess.classList.add("show");

  setTimeout(() => {
    alertSuccess.classList.remove("show");
  }, 1700);
}

function showDanger(text) {
  alertDanger.textContent = text;
  alertDanger.classList.add("show");

  setTimeout(() => {
    alertDanger.classList.remove("show");
  }, 1700);
}

function updateButtonState(input) {
  if (input === "") {
    btnPlay.disabled = true;
  } else {
    btnPlay.disabled = false;
  }
}
