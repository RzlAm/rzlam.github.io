document.addEventListener("DOMContentLoaded", function () {
  document.addEventListener("click", function () {
    bgm.play();
  });

  if (leaderboard.length > 0) {
    btnClear.disabled = false;
  } else {
    btnClear.disabled = true;
  }
  nameInput.value = localStorage.getItem("player-name") || [];
  updateButtonState(nameInput.value.trim());

  nameInput.oninput = () => {
    updateButtonState(nameInput.value.trim());
  };

  nameInput.onkeydown = (event) => {
    if (event.key === "Enter") {
      gameStart();
    }
  };

  btnPlay.onclick = () => {
    gameStart();
  };

  function gameStart() {
    if (nameInput.value.trim() !== "") {
      localStorage.setItem("player-name", nameInput.value.trim());
      startGame(nameInput.value.trim());

      document.addEventListener("keydown", function (event) {
        movePlayer(event.key);
      });

      btnNewGame.onclick = () => {
        startGame(playerName);
      };

      btnExit.onclick = () => {
        clearInterval(countdown);
        modalGameOver.classList.add("none");
        gameScreen.classList.add("none");
        homeScreen.classList.remove("none");
      };

      btnSaveScore.onclick = () => {
        saveScore();
      };

      btnPause.onclick = () => {
        paused = true;
        modalPause.classList.remove("none");
      };

      btnContinue.onclick = () => {
        paused = false;
        modalPause.classList.add("none");
      };

      btnRestart.onclick = () => {
        if (confirm("Are you sure want to restart the game?") === true) {
          paused = false;
          modalPause.classList.add("none");
          startGame(playerName);
        }
      };

      btnMainMenu.onclick = () => {
        if (confirm("Are you sure want to quit the game?") === true) {
          clearInterval(countdown);
          modalPause.classList.add("none");
          gameScreen.classList.add("none");
          homeScreen.classList.remove("none");
        }
      };

      btnUp.onpointerdown = () => {
        movePlayer("ArrowUp");
      };

      btnDown.onpointerdown = () => {
        movePlayer("ArrowDown");
      };

      btnLeft.onpointerdown = () => {
        movePlayer("ArrowLeft");
      };

      btnRight.onpointerdown = () => {
        movePlayer("ArrowRight");
      };

      btnHint.onclick = () => {
        useHint();
      };
    }
  }

  btnInstructions.onclick = () => {
    modalInstructions.classList.remove("none");
  };

  closeInstructions.onclick = () => {
    modalInstructions.classList.add("none");
  };

  closeInstructions2.onclick = () => {
    modalInstructions.classList.add("none");
  };

  btnLeaderboard.onclick = () => {
    modalLeaderboard.classList.remove("none");
    loadScore();
  };

  btnClear.onclick = () => {
    deleteAll();
  };

  closeLeaderboard.onclick = () => {
    modalLeaderboard.classList.add("none");
  };

  closeLeaderboard2.onclick = () => {
    modalLeaderboard.classList.add("none");
  };
});
