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
    var activeScreen = 'staticScreen';
    var ballClicked = false;
    var allFaded = false;
    var paddlesResized = false;
    var paddlesRotated = false;
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


    var switchHSLBackground = 100;
    var switchHSLForeground = 0;

    function wh(num) { // world height units
        return (height / 9) * num;
    }

    function ww(num) { // world width units
        return (width / 16) * num;
    }

    (function start(time) {
        deltaTime = (time - lastTime) / 1000;
        lastTime = time;
        drawloop = requestAnimationFrame(start);
        screenMap[activeScreen]();
    }());

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
                    }
                }
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
    }

    function drawScores() {
        ctx.font = 'bold 72px Arial Black';
        ctx.fillStyle = cpuScoreColour;
        ctx.textAlign = "start";
        ctx.fillText('CPU: ' + cpuScore, ww(13.2), wh(0.75));

        ctx.font = 'bold 72px Arial Black';
        ctx.fillStyle = playerScoreColour;
        ctx.textAlign = "start";
        ctx.fillText('Player: ' + playerScore, ww(0.5), wh(0.75));
    }

    function drawCentralLine() {

    }

    function isBallClicked(e) {
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




}());
