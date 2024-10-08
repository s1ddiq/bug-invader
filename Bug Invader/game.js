function preload() {
    this.load.image('bug1', 'bug_1.png');
    this.load.image('bug2', 'bug_2.png');
    this.load.image('bug3', 'bug_3.png');
    this.load.image('platform', 'platform.png');
    this.load.image('codey', 'codey.png');
    this.load.image('bugPellet', 'bugPellet.webp');
    this.load.image('bugRepellent', 'bugRepellent.png');
  }
  
  // Helper Methods below:
  // sortedEnemies() returns an array of enemy sprites sorted by their x coordinate
  function sortedEnemies(){
    const orderedByXCoord = gameState.enemies.getChildren().sort((a, b) => a.x - b.x);
    return orderedByXCoord;
  }
  // numOfTotalEnemies() returns the number of total enemies 
  function numOfTotalEnemies() {
      const totalEnemies = gameState.enemies.getChildren().length;
    return totalEnemies;
  }
  
  const gameState = {};
  
  function create() {
      // When gameState.active is true, the game is being played and not over. When gameState.active is false, then it's game over
      gameState.active = true;

      // When gameState.active is false, the game will listen for a pointerup event and restart when the event happens
      this.input.on('pointerup', () => {
          if (gameState.active === false) {
              this.scene.restart();
          }
      })
  
      let bugsLeft = 24;
      // Creating static platforms
      const platforms = this.physics.add.staticGroup();
      platforms.create(225, 490, 'platform').setScale(1, .3).refreshBody();
  
      // Displays the initial number of bugs, this value is initially hardcoded as 24 
      gameState.scoreText = this.add.text(175, 482, `Bugs Left: ${bugsLeft}`, { fontSize: '15px', fill: '#000000' });
  
      // Uses the physics plugin to create Codey
      gameState.player = this.physics.add.sprite(225, 450, 'codey').setScale(.5);
  
      // Create Collider objects
      gameState.player.setCollideWorldBounds(true);
      this.physics.add.collider(gameState.player, platforms);
      
      // Creates cursor objects to be used in update()
      gameState.cursors = this.input.keyboard.createCursorKeys();
  
      // Add new code below:
      gameState.enemies = this.physics.add.group();
      gameState.enemyVelocity = 1;
      for (let yVal = 1; yVal < 4; yVal++) {
        for (let xVal = 1; xVal < 9; xVal++) {
            gameState.enemies.create(50 * xVal, 50 * yVal, 'bug1').setScale(.6).setGravityY(-200);
        }
      }


    let pellets = this.physics.add.group();
  
    function genPellet() {
      let randomBug = Phaser.Utils.Array.GetRandom(gameState.enemies.getChildren());
      pellets.create(randomBug.x, randomBug.y, 'bugPellet');
    }
  
    gameState.pelletsLoop = this.time.addEvent({
      delay: 300,
      callback: genPellet,
      callbackScope: this,
      loop: true,
    })
  
    this.physics.add.collider(pellets, platforms, (pellet) => {
      pellet.destroy();
    });
    
    this.physics.add.collider(pellets, gameState.player, () => {
      gameState.enemyVelocity = 1;
      gameState.active = false;
      gameState.pelletsLoop.destroy();
      this.physics.pause();
      gameState.gameOverText = this.add.text(222, 222, 'GAME OVER', 
      { fontSize: '15px', fill: '#121212', color: 'red' });
  
    })
  
    gameState.bugRepellent = this.physics.add.group();
  
    this.physics.add.collider(gameState.bugRepellent, gameState.enemies, (bug, repellent) => {
      bug.destroy();
      repellent.destroy();
      bugsLeft -= 1;
      gameState.scoreText.setText(`Bugs Left: ${bugsLeft}`)
    })
  }
  
  function update() {
    if (gameState.active) {
        // Check if all bugs are defeated
        if (numOfTotalEnemies() === 0) {
            gameState.enemyVelocity = 1;
            gameState.scoreText.setText(`You won!`);
            gameState.active = false;
            this.physics.pause();
            this.input.on('pointerup', () => {
                if (gameState.active === false) {
                    this.scene.restart();
                }
            })
        
            
        } else {
            // Move the bugs
            gameState.enemies.getChildren().forEach((bug) => {
                bug.x += gameState.enemyVelocity;
            });

            // Check the left-most and right-most bugs
            gameState.leftMostBug = sortedEnemies()[0];
            gameState.rightMostBug = sortedEnemies()[sortedEnemies().length - 1];

            // Reverse bug movement when hitting the screen edges
            if (gameState.leftMostBug.x < 10 || gameState.rightMostBug.x > 440) {
                gameState.enemyVelocity *= -1; // Reverse the direction
                gameState.enemies.getChildren().forEach(enemy => {
                    enemy.y += 10; // Move bugs down
                });
            }
        }

        // Player movement
        if (gameState.cursors.left.isDown) {
            gameState.player.setVelocityX(-160);
        } else if (gameState.cursors.right.isDown) {
            gameState.player.setVelocityX(160);
        } else {
            gameState.player.setVelocityX(0);
        }

        // Shoot bug repellent when spacebar is pressed
        if (Phaser.Input.Keyboard.JustDown(gameState.cursors.space)) {
            gameState.bugRepellent.create(gameState.player.x, gameState.player.y, 'bugRepellent').setGravityY(-400);
        }
    }
}

  
  const config = {
      type: Phaser.AUTO,
      width: 450,
      height: 500,
      backgroundColor: "b9eaff",
      physics: {
          default: 'arcade',
          arcade: {
              gravity: { y: 200 },
              enableBody: true,
          }
      },
      scene: {
          preload,
          create,
          update
      }
  };
  
  
  const game = new Phaser.Game(config);