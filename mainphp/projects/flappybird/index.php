<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <link rel="stylesheet" href="../../css/general.css">
    <!--<link rel="stylesheet" href="../css/index.css">-->
    <link rel="stylesheet" href="../../css/pages.css">
    <link rel="stylesheet" href="flappybird.css">
    <link rel="stylesheet" href="../../css/fontawesome.css">
    <link rel="shortcut icon" type="image/x-icon" href="../../favicon.ico"/>
    <!--Used from https://fontawesome.com under license https://fontawesome.com/license-->
    <title>Games - Flappy Bird</title>
</head>

<header class="title-box">
    <div class="nav-bar">
        <div class="links-bar">
            <a href="../../" class="nav-home nav-button">Home</a>
            <a href="../" class="nav-link nav-button">Projects</a>
            <a href="https://paypal.me/noodlewrecker" class="nav-link nav-button">Donate</a>
        </div>
        <?php
        $socialBarResponse = file_get_contents("../../../hidden/social-bar.html");
        echo $socialBarResponse;
        ?>
    </div>

    <!--<h1 class="title">
        Flappy Bird
    </h1>-->
    <!--<h2 class="sub-heading">
        Alpha
    </h2>-->
</header>

<body>

<div class="page-chunk canvasContainer" style="margin-top: 50px;">

    <h3 class="flappy-head" id="temp">Flappy Bird<p style="font-size: x-small;">If you get over 65 by 7/2/19 you get a fiver</p></h3>
    <div class="flappy-container" style="background-color: whitesmoke">
        <div style="width: 480px; height: 640px; margin: 0; padding: 0;"></div>
        <canvas id="backgroundC" width="480" height="560"
                style="position: absolute; margin-left: auto; margin-right: auto; left: 0; right: 0; z-index: 0; top: 0;"></canvas>
        <canvas id="gameCanvas" width="480" height="640"
                style="position: absolute; margin-left: auto; margin-right: auto; left: 0; right: 0; z-index: 1; top: 0;"></canvas>
        <script src="flappybird.js"></script>
    </div>
    <h4 class="flappy-foot">Designed by Adam Hodgkinson</h4>
</div>
</body>
</html>
