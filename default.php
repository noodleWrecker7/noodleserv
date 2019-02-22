<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <link rel="stylesheet" href="../../css/general.css">
    <!--<link rel="stylesheet" href="../css/index.css">-->
    <link rel="stylesheet" href="../../css/pages.css">
    <link rel="stylesheet" href="../../css/fontawesome.css">
    <link rel="shortcut icon" type="image/x-icon" href="../../favicon.ico"/>
    <!--Used from https://fontawesome.com under license https://fontawesome.com/license-->
    <title>Window - Title</title>
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

    <h1 class="title">
        Title
    </h1>
    <h2 class="sub-heading">
        Sub-head
    </h2>
</header>

<body>
<div class="page-chunk scoresDef" style="background-color: whitesmoke">
    <p style="font-family: 'Montserrat', sans-serif; font-size: large ">Page chunk for things</p>
</div>
<div class="page-chunk canvasContainer">
    <canvas id="gameCanvas" width="800" height="600">Loading...</canvas>
    <script src="game.js"></script>
</div>
</body>
</html>
