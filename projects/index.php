<?php
function test_input($data)
{
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}

if ($_GET['p'] == null || $_GET['p'] < 1) {
    header('Location: ?p=1');
}

$response = file_get_contents('projectList.json');
//echo $response;
$response = json_decode($response, true);
//echo print_r($response, true);
$pageNum = $_GET['p'];
$pageNum = test_input($pageNum);
$totalEntries = count($response);
$totalPagesNeeded = ceil($totalEntries / 8);

if ($pageNum > $totalPagesNeeded) {
    header('Location: ?p=' . $totalPagesNeeded);
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <link rel="stylesheet" href="projectsGrid.css">
    <link rel="stylesheet" href="../css/index.css">

    <link rel="stylesheet" href="../css/general.css">
    <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.4.2/css/all.css"
          integrity="sha384-/rXc/GQVaYpyDdyxK+ecHPVYJSN9bmVFBvjA/9eOB+pb3F2w2N6fc5qB9Ew5yIns" crossorigin="anonymous">
    <link rel="shortcut icon" type="image/x-icon" href="../favicon.ico"/>
    <!--Used from https://fontawesome.com under license https://fontawesome.com/license-->
    <title>Noodle - Projects</title>
</head>

<header class="title-box">
    <nav class="nav-bar">
        <div class="links-bar">
            <a href="../" class="nav-home nav-button">Home</a>
            <a href="#" class="nav-link nav-button">Projects</a>
            <!--<a href="" class="nav-link nav-button">Button</a>
            <a href="#" class="nav-link nav-button">Gingers</a>
            <a href="" class="nav-link nav-button">Button</a>-->
        </div>
        <div class="social-bar">
            <a href="https://twitter.com/AdamH0461" class="social-link twitter"><i class="fab fa-twitter"></i>
                Twitter</a>
            <a href="https://github.com/noodleWrecker7" class="social-link github"><i class="fab fa-github"></i> Github</a>
            <a href="" class="social-link instagram"><i class="fab fa-instagram"></i> Instagram</a>
            <a href="" class="social-link discord"><i class="fab fa-discord"></i> Discord</a>
        </div>
    </nav>
    <h1 class="title">
        Projects
    </h1>
    <h2 class="sub-heading">
        I dont know what this is for
    </h2>

</header>


<div class="grid">
    <?php
    echo "<div class=\"row\">";

    $startEntry = ($pageNum - 1) * 8;
    for ($i = 0; $i < 8; $i++) {
        $actualNum = $startEntry + $i;
        if ($i == 4) { // separate two rows
            echo "</div>";
            echo "<div class=\"row\">";
        }
        // actual item here:
        //echo $response[$i]['name'];
        $item = $response[$actualNum];
        if ($item != null) {
            echo "
            <a href=\"" . $item['link'] . "\" class=\"item\">
                <div class=\"picture\">
                    <img src=\"img/" . $item['img'] . "\">
                </div>
                <h3 class=\"item-head\">" . $item['name'] . "</h3>
                <p class=\"item-text\">" . $item['blurb'] . "</p>
                <p class=\"date\">" . $item['date'] . "</p>
            </a>";
        }
    }

    echo "</div>";
    ?>

    <!--<div class="row">

        <a href="hangman/" class="item">
            <div class="picture">
                <img src="img/hangman.png">
            </div>
            <h3 class="item-head">Hangman</h3>
            <p class="item-text">WIP!</p>
            <p class="date"></p>
        </a>

        <a href="minesweeper/" class="item">
            <div class="picture">
                <img src="img/minesweeper.png">
            </div>
            <h3 class="item-head">Minesweeper</h3>
            <p class="item-text">The most polished game on here.</p>
            <p class="date">13/1/2019</p>
        </a>

        <a href="tetris/#tetrisCanvas" class="item">
            <div class="picture">
                <img src="img/tetris.png">
            </div>
            <h3 class="item-head">Tetris</h3>
            <p class="item-text">Half-assed attempt at Tetris.</p>
            <p class="date">23/12/2018</p>
        </a>

        <a href="snake/" class="item">
            <div class="picture">
                <img src="img/snake.png">
            </div>
            <h3 class="item-head">Snake</h3>
            <p class="item-text">Snek is good game yes? Play now!</p>
            <p class="date">3/11/2018</p>
        </a>


    </div>

    <div class="row">

        <a href="pong/" class="item">
            <div class="picture">
                <img src="img/pong.png">
            </div>
            <h3 class="item-head">Pong</h3>
            <p class="item-text">Simple remake of pong</p>
            <p class="date">27/8/2018</p>
        </a>

        <a href="#" class="item">
            <div class="picture">
                <img src="img/placeholder.png">
            </div>
            <h3 class="item-head">item-head</h3>
            <p class="item-text">item-text item-text item-text item-text item-text item-text item-text</p>
        </a>
    </div> -->
</div>

<!--<div class="pagination">
    <a href="#">&laquo;</a>
    <a href="index.php?p=1">1</a>
    <a href="index.php?p=2">2</a>
    <a href="index.php?p=3">3</a>
    <a href="index.php?p=4">4</a>
    <a href="index.php?p=5">5</a>
    <a href="#">&raquo;</a>
</div>-->

<?php
echo "<div class=\"pagination\">";
$x = $pageNum - 1; // for back
echo "<a href=\"index.php?p=$x\">&laquo;</a>";

if ($pageNum < 3) {
    for ($i = 1; $i <= 5; $i++) {
        if ($i == $pageNum) {
            echo "<a class=\"selected\" \"href=\"index.php?p=$i\">$i</a>";
        } else {
            echo "<a href=\"index.php?p=$i\">$i</a>";
        }
    }
} else {
    echo "
        <a href=\"index.php?p=" . $pageNum - 2 . "\">" . $pageNum - 2 . "</a>
        <a href=\"index.php?p=" . $pageNum - 1 . "\">" . $pageNum - 1 . "</a>
        <a class= \"selected\" href=\"index.php?p=" . $pageNum . "\">" . $pageNum . "</a>
        <a href=\"index.php?p=" . ($pageNum + 1) . "\">" . ($pageNum + 1) . "</a>
        <a href=\"index.php?p=" . ($pageNum + 2) . "\">" . ($pageNum + 2) . "</a>";
}


$x += 2; // for forward
echo "<a href=\"index.php?p=$x\">&raquo;</a>";

echo "</div>";
?>

<div class="foot">
    <p class="credit">Designed by Adam Hodgkinson</p>
</div>
</html>