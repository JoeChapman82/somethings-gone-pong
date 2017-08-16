document.ready = (function() {
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');
    var width = canvas.width;
    var height = canvas.height;
    var drawLoop;
    var lastTime = 0;
    var deltaTime = 0;
    var mainTimer = 0;
    var playerScore = 0;
    var cpuScore = 0;
    var startTimer = 3;
    var aiTimerStart = 1;
    var aiTimer = 1;
    var aiCanMove = true;
    var halfPaddleHeight = 125;
    var countDownArray = ['GO!', '1', '2', '3'];
    // var activeScreen = 'staticScreen';
    var activeScreen = 'gameScreen';
    var upPressed = false;
    var downPressed = false;
    var ballClicked = false;
    var allFaded = false;
    var paddlesResized = false;
    var paddlesRotated = false;
    var coloursInverted = false;
    var gameReady = false;
    var gamePlaying = false;
    var paddleHeight = 40;
    var paddleWidth = 250;
    var rotation = 0.1;
    var screenMap = {
        staticScreen: function() {
            return staticScreen();
        },
        introScreen: function() {
            return introScreen();
        },
        startScreen: function() {
            return startScreen();
        },
        gameScreen: function() {
            return gameScreen();
        }
    };

    var goneWrongText = 'Something\'s gone wrong';

    var staticFooter = {
        x: 0,
        y: wh(5.5),
        width: width,
        height: wh(3.5)
    };

    var ball = {
        x: ww(9.38),
        y: wh(1.4),
        width: 15,
        height: 15,
        vx: 0,
        vy: 0
    };

    function updateBall() {
        ball.x += ball.vx;
        ball.y += ball.vy;
    }

    var playerPaddle = {
        x: 0,
        y: 0,
        width: width,
        height: wh(0.55),
        vx: 0,
        vy: 0,
    };

    function playerPaddleUpdate() {
        playerPaddle.y += playerPaddle.vy;
    }

    var cpuPaddle = {
        x: 0,
        y: wh(5.5),
        width: width,
        height: 1,
        vx: 0,
        vy: 0,
        colour: 'rgba(128, 128, 128, 1)'
    };

    function cpuPaddleUpdate() {
        cpuPaddle.y += cpuPaddle.vy;
    }

    var alphas = {
        govuk: 1,
        goneWrong: 1,
        lede: 1,
        content: 1,
        pon: 1,
        licence: 1,
        playerScore: 0,
        cpuScore: 0,
    };

    var playerScoreColour = 'rgba(0, 0, 0, ' + alphas.playerScore + ')';
    var cpuScoreColour = 'rgba(0, 0, 0, ' + alphas.cpuScore + ')';

    var crown = new Image();
    crown.src = '../images/crown.png';

    var lion = new Image();
    lion.src = '../images/lion.png';

    document.addEventListener('click', isBallClicked);
    document.addEventListener('touchstart', isBallClicked);
    document.addEventListener('keydown', function(e) {
        if(e.keyCode === 38) {
            e.preventDefault();
            upPressed = true;
        } else if(e.keyCode === 40) {
            e.preventDefault();
            downPressed = true;
        }
    });
    document.addEventListener('keyup', function(e) {
        if(e.keyCode === 38) {
            e.preventDefault();
            upPressed = false;
        } else if(e.keyCode === 40) {
            e.preventDefault();
            downPressed = false;
        }
    });

    document.addEventListener('touchstart', function(e) {
        var gcbr = canvas.getBoundingClientRect();
        var cy = e.touches[0].clientY;
        var r = ctx.canvas.clientWidth / canvas.width; // the ratio of the canvas actual width to it's original width
        var rh = ctx.canvas.clientHeight / canvas.height; // as above, for height
        if(cy > (gcbr.top + gcbr.bottom / 2) * rh) {
            upPressed = true;
        } else {
            downPressed = true;
        }
    });

    document.addEventListener('touchend', function(e) {
        upPressed = false;
        downPressed = false;
    });

    document.addEventListener('touchmove', function(e) {
        if(gamePlaying) {
            e.preventDefault();
        }
    });


    var switchHSLBackground = 100;
    var switchHSLForeground = 0;

    function wh(num) { // world height units
        return (height / 9) * num;
    }

    function ww(num) { // world width units
        return (width / 16) * num;
    }

    function start(time) {
        deltaTime = (time - lastTime) / 1000;
        lastTime = time;
        drawloop = requestAnimationFrame(start);
        screenMap[activeScreen]();
    }

    function stop() {
        cancelAnimationFrame(drawloop);
    }

    function pause() {
        if(!paused) {
            stop();
        } else {
            start();
        }
    }

    function delay(time) {
        stop();
        setTimeout(function() {
            start();
        }, time);
    }

    function staticScreen() {
        ctx.clearRect(0, 0, width, height);
        drawStaticBody();
        drawPlayerPaddle();
        drawStaticHeader();
        drawIntroCrown();
        drawStaticFooter();
        drawCpuPaddle();
        drawStaticLion();
        drawBall();
    }

    function introScreen() {
        ctx.clearRect(0, 0, width, height);
        drawStaticBody();
        drawStaticFooter();
        introManager();
        drawStaticHeader();
        drawBall();
    }

    function startScreen() {

    }

    function gameScreen() {
        if(!gamePlaying) {
            resetGame();
            gamePlaying = true;
        }
        ctx.clearRect(0, 0, width, height);
        drawBackground();
        updateBall();
        keepBallInBounds();
        checkGoals();
        checkPaddleBallCollisions();
        managePlayerPaddle();
        ai();
        drawScores();
        drawBall();
        drawPlayerPaddle();
        drawCpuPaddle();
    }


    // staticScreen functions
    function drawStaticBody() {
        ctx.beginPath();
        ctx.rect(0, 0, width, height);
        ctx.fillStyle = 'hsl(0, 0%, ' + switchHSLBackground + '%)';
        ctx.fill();
        ctx.closePath();

        ctx.font = 'bold 64px Arial';
        ctx.fillStyle = 'rgba(0, 0, 0, ' + alphas.goneWrong + ')';
        ctx.textAlign = "start";
        ctx.fillText(goneWrongText, ww(3), wh(1.5));

        ctx.font = '36px Arial';
        ctx.fillStyle = 'rgba(0, 0, 0, ' + alphas.lede + ')';
        ctx.textAlign = "start";
        ctx.fillText('Unfortunately you can\'t use this service', ww(3), wh(2.4));

        ctx.font = '36px Arial';
        ctx.fillStyle = 'rgba(0, 0, 0, ' + alphas.lede + ')';
        ctx.textAlign = "start";
        ctx.fillText('right now.', ww(3), wh(2.85));

        ctx.font = '28px Arial';
        ctx.fillStyle = 'rgba(0, 0, 0, ' + alphas.content + ')';
        ctx.textAlign = "start";
        ctx.fillText('Come back later and try again', ww(3), wh(3.5));
    }

    function drawStaticHeader() {
        ctx.font = 'bold 34px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255,' + alphas.govuk + ')';
        ctx.textAlign = "start";
        ctx.fillText('GOV.UK', ww(3.5), wh(0.40));
    }

    function drawIntroCrown() {
        ctx.drawImage(crown, ww(3), 10, 52, 45);
    }

    function drawStaticFooter() {
        ctx.beginPath();
        ctx.rect(staticFooter.x, staticFooter.y, staticFooter.width, staticFooter.height);
        ctx.fillStyle = 'rgba(222, 224, 226, 1)';
        ctx.fill();
        ctx.closePath();

        ctx.font = 'bold 30px Impact';
        ctx.fillStyle = 'rgba(70, 73, 75, ' + alphas.pon + ')';
        ctx.textAlign = 'start';
        ctx.fillText('PON', ww(3), wh(7.5));

        ctx.font = '18px Arial';
        ctx.fillStyle = 'rgba(70, 73, 75, ' + alphas.licence + ')';
        ctx.textAlign = 'start';
        ctx.fillText('All content is available under the Personally Organised Non Government Licence v3.0, except where otherwise stated', ww(3.5), wh(7.5));
    }

    function drawStaticLion() {
        ctx.drawImage(lion, ww(12), wh(6.5), 120, 180);
        ctx.font = '14px Arial';
        ctx.fillStyle = 'rgba(70, 73, 75, 1)';
        ctx.textAlign = 'start';
        ctx.fillText('roar', ww(12.7), wh(6.6));
    }

    function introManager() {
        if(!allFaded) {
            drawPlayerPaddle();
            drawCpuPaddle();
            completeMess();
        } else {
            if(ball.vy === 0) {
                ball.vy = 3;
            }
            updateBall();
            if(!paddlesResized) {
                drawPlayerPaddle();
                drawCpuPaddle();
                keepBallInIntroBounds();
                reSizeIntroPaddles();
            } else {
                keepBallInBounds();
                rotateIntroPaddles();
                if(paddlesRotated) {
                    fadeInCentralLine();
                    fadeInScores();
                    drawCentralLine();
                    drawScores();
                    if(alphas.cpuScore >= 1) {
                        invertColours();
                        if(coloursInverted) {
                            dustyBin();
                            if(gameReady) {
                                resetGame();
                                gamePlaying = true;
                                activeScreen = 'gameScreen';
                            }
                        }
                    }
                } // wheeeeee
            }
        }

    }


    function completeMess() {
        goneWrongText = 'Something\'s gone PONG';
        if(alphas.lede > 0) {
            alphas.lede -= 0.02;
        } else {
            if(alphas.content > 0) {
                alphas.content -= 0.02;
            } else {
                if(alphas.pon > 0) {
                    alphas.pon -= 0.02;
                } else {
                    if(alphas.licence > 0) {
                        alphas.licence -= 0.02;
                    } else {
                        if(alphas.govuk > 0) {
                            alphas.govuk -= 0.02;
                        } else {
                            if(alphas.goneWrong > 0) {
                                alphas.goneWrong -= 0.02;
                                ball.width += 0.6;
                                ball.height += 0.6;
                            } else {
                                allFaded = true;
                            }
                        }
                    }
                }
            }
        }
    }

    function reSizeIntroPaddles() {
        cpuPaddle.colour = 'hsl(0, 0%, ' + switchHSLForeground + '%)';
        if(playerPaddle.height > paddleHeight) {
            playerPaddle.height -= 0.5;
        }
        if(playerPaddle.width > paddleWidth) {
            playerPaddle.width -= 2;
            playerPaddle.x += 1;
        }
        if(staticFooter.height > 0) {
            staticFooter.height -= 2;
            staticFooter.y += 2;
        }
        if(cpuPaddle.height < paddleHeight) {
            cpuPaddle.height += 0.5;
        }
        if(cpuPaddle.width > paddleWidth) {
            cpuPaddle.width -= 2;
            cpuPaddle.x += 1;
        }
        if(cpuPaddle.y < canvas.height - cpuPaddle.height) {
            cpuPaddle.y += 2;
        }
        if(playerPaddle.width <= paddleWidth && cpuPaddle.width <= paddleWidth) {
            paddlesResized = true;
        }
    }

    function rotateIntroPaddles() {
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(rotation * Math.PI / 180);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);
        drawPlayerPaddle();
        drawCpuPaddle();
        ctx.restore();
        if(rotation > -90) {
            playerPaddle.y -= 0.8;
            cpuPaddle.y += 0.8;
            rotation -= 0.2;
        } else {
            paddlesRotated = true;
        }
    }

    function fadeInCentralLine() {

    }

    function fadeInScores() {
        if(alphas.cpuScore < 1) {
            alphas.cpuScore += 0.02;
            alphas.playerScore += 0.02;
        }
        if(alphas.cpuScore >= 1) {
            cpuScoreColour = 'hsl(0, 0%, ' + switchHSLForeground + '%)';
            playerScoreColour = 'hsl(0, 0%, ' + switchHSLForeground + '%)';
            cpuPaddle.colour = 'hsl(0, 0%, ' + switchHSLForeground + '%)';
        }
    }

    function invertColours() {
        if(switchHSLBackground > 0) {
            switchHSLBackground -= 0.5;
        }
        if(switchHSLForeground < 100) {
            switchHSLForeground += 0.5;
        }
        if(switchHSLForeground >= 100) {
            coloursInverted = true;
        }
    }

    function dustyBin() {
        startTimer -= deltaTime;
        if(countDownArray[Math.ceil(startTimer)] !== undefined) {
            var countDownText = countDownArray[Math.ceil(startTimer)];
            ctx.font = 'bold 120px Arial Black';
            ctx.fillStyle = cpuScoreColour;
            ctx.textAlign = "center";
            ctx.fillText(countDownText, canvas.width / 2, canvas.height / 2);
        } else {
            gameReady = true;
        }

    }

    function keepBallInIntroBounds() {
        if(ball.y < playerPaddle.y + playerPaddle.height || ball.y > cpuPaddle.y - ball.height) {
            ball.vy = -ball.vy;
        }
    }

    function keepBallInBounds() {
        if(ball.y < 0 || ball.y > canvas.height - ball.height) {
            ball.vy = -ball.vy;
        }
        if(ball.y < 0) {
            ball.y = 0;
        } else if(ball.y > canvas.height - ball.height) {
            ball.y = canvas.height - ball.height;
        }
    }

    function checkGoals() {
        if(ball.x < 0) {
            if(cpuScore === 2) {
                drawWinLose('cpu');
                delay(5000);
                cpuScore = 0;
                playerScore = 0;
            } else {
                cpuScore++;
                delay(2000);
            }
            resetBall();
            resetGame();
        }
        if(ball.x > canvas.width - ball.width) {
            if(playerScore === 2) {
                drawWinLose('player');
                delay(5000);
                playerScore = 0;
                cpuScore = 0;
            } else {
                playerScore++;
                delay(2000);
            }
            resetGame();
            resetBall();
        }
    }

    function drawWinLose(x) {
        var text = x === 'cpu' ? 'lose :(' : 'win!';
        ctx.font = 'bold 120px Arial Black';
        ctx.fillStyle = cpuScoreColour;
        ctx.textAlign = "center";
        ctx.fillText('You ' + text, canvas.width / 2, canvas.height / 2);
    }

    function drawCentralLine() {

    }

    function isBallClicked(e) {
    e = e.touches[0] !== undefined ? e.touches[0] : e;
    if(!ballClicked) {
        var gcbr = canvas.getBoundingClientRect();
        var cx = e.clientX;
        var cy = e.clientY;
        var r = ctx.canvas.clientWidth / canvas.width; // the ratio of the canvas actual width to it's original width
        var rh = ctx.canvas.clientHeight / canvas.height; // as above, for height
        if(cx > gcbr.left + ball.x * r && cx < gcbr.left + ball.x * r + ball.width * r && cy > gcbr.top + ball.y * rh && cy < gcbr.top + ball.y * rh + ball.height * rh) {
            ballClicked = true;
            activeScreen = 'introScreen';
        }
    }
}

    function resetGame() {
        var num = Math.random() * (6 - 1) + 1;
        num *= Math.floor(Math.random() * 2) === 1 ? 1 : -1;
        var numx = 6;
        numx *= Math.floor(Math.random() * 2) === 1 ? 1 : -1;
        playerPaddle.x = ww(0.49);
        playerPaddle.y = wh(3.47);
        playerPaddle.width = 40;
        playerPaddle.height = 250;

        cpuPaddle.x = ww(15.17);
        cpuPaddle.y = wh(3.45);
        cpuPaddle.width = 40;
        cpuPaddle.height = 250;
        switchHSLBackground = 0;
        switchHSLForeground = 100;
        cpuScoreColour = 'hsl(0, 0%, ' + switchHSLForeground + '%)';
        playerScoreColour = 'hsl(0, 0%, ' + switchHSLForeground + '%)';
        cpuPaddle.colour = 'hsl(0, 0%, ' + switchHSLForeground + '%)';
        playerPaddle.colour = 'hsl(0, 0%, ' + switchHSLForeground + '%)';
        ball.width = 45;
        ball.height = 45;
        // if(ball.vx < 6) {
            ball.vx = numx;
        // }
        // if(ball.vy > -6) {
            ball.vy = num;
        // }
        startTimer = 3;
    }

    function resetBall() {
        ball.x = canvas.width / 2;
        ball.y = canvas.height / 2;
    }

    // game functions
    function drawBackground() {
        ctx.beginPath();
        ctx.rect(0, 0, width, height);
        ctx.fillStyle = 'hsl(0, 0%, ' + switchHSLBackground + '%)';
        ctx.fill();
        ctx.closePath();
    }

    function drawScores() {
        ctx.font = 'bold 72px Arial Black';
        ctx.fillStyle = cpuScoreColour;
        ctx.textAlign = "start";
        ctx.fillText('CPU: ' + cpuScore, ww(12.4), wh(0.75));

        ctx.font = 'bold 72px Arial Black';
        ctx.fillStyle = playerScoreColour;
        ctx.textAlign = "start";
        ctx.fillText('Player: ' + playerScore, ww(1), wh(0.75));
    }

    function drawBall() {
        ctx.beginPath();
        ctx.rect(ball.x, ball.y, ball.width, ball.height);
        ctx.fillStyle = 'hsl(0, 0%, ' + switchHSLForeground + '%)';
        ctx.fill();
        ctx.closePath();
    }

    function drawPlayerPaddle() {
        ctx.beginPath();
        ctx.rect(playerPaddle.x, playerPaddle.y, playerPaddle.width, playerPaddle.height);
        ctx.fillStyle = 'hsl(0, 0%, ' + switchHSLForeground + '%)';
        ctx.fill();
        ctx.closePath();
    }

    function drawCpuPaddle() {
        ctx.beginPath();
        ctx.rect(cpuPaddle.x, cpuPaddle.y, cpuPaddle.width, cpuPaddle.height);
        ctx.fillStyle = cpuPaddle.colour;
        ctx.fill();
        ctx.closePath();
    }

    function managePlayerPaddle() {
        if(upPressed) {
            playerPaddle.y -= 3;
        } else if(downPressed) {
            playerPaddle.y += 3;
        }
        if(playerPaddle.y < 0) {
            playerPaddle.y = 0;
        } else if(playerPaddle.y > canvas.height - playerPaddle.height) {
            playerPaddle.y = canvas.height - playerPaddle.height;
        }
    }

    function ai() {
        if(ball.y > cpuPaddle.y && ball.y < cpuPaddle.y + cpuPaddle.height) {
            return;
        }
        if(ball.y > cpuPaddle.y + cpuPaddle.height / 2) {
            cpuPaddle.y += 3.5;
        } else if (ball.y < cpuPaddle.y + cpuPaddle.height / 2) {
            cpuPaddle.y -= 3.5;
        }
        if(cpuPaddle.y < 0) {
            cpuPaddle.y = 0;
        } else if(cpuPaddle.y > canvas.height - cpuPaddle.height) {
            cpuPaddle.y = canvas.height - cpuPaddle.height;
        }
    }

    function checkPaddleBallCollisions() {
        if(checkCollisions(ball, playerPaddle)) {
            console.log(ball.vx);
            ball.vx = 6;
            ball.vy = ((ball.y + ball.height / 2) - (playerPaddle.y + playerPaddle.height / 2)) / (halfPaddleHeight + ball.height / 2) * 6;
        }
        if(checkCollisions(ball, cpuPaddle)) {
            ball.vx = -6;
            console.log(ball.vx);

            ball.vy = ((ball.y + ball.height / 2) - (cpuPaddle.y + cpuPaddle.height / 2)) / (halfPaddleHeight + ball.height / 2) * 6;
        }

    }


    function checkCollisions(item, ob) {
        var isColliding;
        if(item.x + item.width >= ob.x && item.x <= ob.x + ob.width && item.y + item.height >= ob.y && item.y <= ob.y + ob.height) {
            isColliding = true;
        }
        return isColliding;
    }



    start();

}());
