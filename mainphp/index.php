<!DOCTYPE html>
<html lang="en">
<head>
    <!--<script async src="//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>-->
    <script>
        (adsbygoogle = window.adsbygoogle || []).push({
            google_ad_client: "ca-pub-8416513482000989",
            enable_page_level_ads: true
        });
    </script>
    <title>Noodle - Home</title>
    <link rel="stylesheet" href="css/index.css">
    <link rel="stylesheet" href="css/general.css">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Montserrat">
    <link rel="stylesheet" href="css/fontawesome.css">
    <link rel="icon" type="image/ico" href="favicon.ico"/>
    <!--Used from https://fontawesome.com under license https://fontawesome.com/license-->
</head>
<header class="title-box">
    <div class="nav-bar">
        <div class="links-bar">
            <a href="#" class="nav-home nav-button">Home</a>
            <a href="projects/" class="nav-link nav-button">Projects</a>
            <a href="https://paypal.me/noodlewrecker" class="nav-link nav-button">Donate</a>
        </div>
    </div>
    <h1 class="title">
        noodleWrecker7
    </h1>
    <h2 class="sub-heading">
        Yeah I have a website
    </h2>
    <?php
    $socialBarResponse = file_get_contents("../hidden/social-bar.html");
    echo $socialBarResponse;
    ?>
</header>
<div class="main">
    <div class="content-chunk">
        <div class="content-side">
            <i class="fas fa-gamepad"></i>
        </div>
        <div class="content">
            <h3 class="content-header">Welcome!</h3>
            <p class="main-text">Here's a collection of a bunch of things I've made!
                <br> <br>
                All the projects I've created can be found by going to the projects tab
                at the top. They are mostly made using standard HTML, CSS and Javascript with a little bit
                of server-side scripting.</p>
            <p class="subtext"></p>
        </div>
    </div>

    <div class="content-chunk grey">
        <div class="content">
            <h3 class="content-header">Donate</h3>
            <p class="main-text">If you like what you find here please consider donating. Although
                hosting this site is technically free, my time isn't so please fund my quest to
                <del>conquer the world and everything on it </del> build awesome games.
            </p>
            <p class="subtext">The donate button at the top takes you to my paypal page.</p>
        </div>
        <div class="content-side">
            <i class="fas fa-hand-holding-usd"></i>
        </div>
    </div>

    <div class="content-chunk">
        <div class="content-side">
            <i class="fas fa-at"></i>
        </div>
        <div class="content">
            <h3 class="content-header">Contact</h3>
            <p class="main-text">If you want to talk to me, you've found a bug or have suggestion
                you can find me at
                <a href="mailto://hodgkinson.adam@gmail.com">hodgkinson.adam@gmail.com</a></p>
            <p class="subtext"></p>
        </div>
    </div>

    <!--<div class="content-chunk dark-grey">
        <div class="content" style="padding-bottom: 0px;">
            <p class="bottom-text">Designed by Adam Hodgkinson</p>
        </div>
    </div>-->
</div>

<div class="foot">
    <p class="credit">Designed by Adam Hodgkinson</p>
</div>
</html>