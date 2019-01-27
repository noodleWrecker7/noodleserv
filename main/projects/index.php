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

$projectsResponse = file_get_contents('../../hidden/projectList.json');
//echo $response;
$projectsResponse = json_decode($projectsResponse, true);
//echo print_r($response, true);
$pageNum = $_GET['p'];
$pageNum = test_input($pageNum);
$totalEntries = count($projectsResponse);
$totalPagesNeeded = ceil($totalEntries / 8);

if ($pageNum > $totalPagesNeeded) {
    header('Location: ?p=' . $totalPagesNeeded);
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <link rel="stylesheet" href="../css/projectsGrid.css">
    <link rel="stylesheet" href="../css/index.css">

    <link rel="stylesheet" href="../css/general.css">
    <link rel="stylesheet" href="../css/fontawesome.css">
    <link rel="shortcut icon" type="image/x-icon" href="../favicon.ico"/>
    <!--Used from https://fontawesome.com under license https://fontawesome.com/license-->
    <title>Noodle - Projects</title>
</head>

<header class="title-box">
    <nav class="nav-bar">
        <div class="links-bar">
            <a href="../" class="nav-home nav-button">Home</a>
            <a href="#" class="nav-link nav-button">Projects</a>
            <a href="https://paypal.me/noodlewrecker" class="nav-link nav-button">Donate</a>
        </div>

        <?php
            $socialBarResponse = file_get_contents("../../hidden/social-bar.html");
            echo $socialBarResponse;
        ?>
    </nav>
    <h1 class="title">
        Projects
    </h1>
    <h2 class="sub-heading">
        A collection of everything I've made.
    </h2>

</header>
<br>
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
        <a href=\"index.php?p=" . ($pageNum - 2) . "\">" . ($pageNum - 2) . "</a>
        <a href=\"index.php?p=" . ($pageNum - 1) . "\">" . ($pageNum - 1) . "</a>
        <a class= \"selected\" href=\"index.php?p=" . $pageNum . "\">" . $pageNum . "</a>
        <a href=\"index.php?p=" . ($pageNum + 1) . "\">" . ($pageNum + 1) . "</a>
        <a href=\"index.php?p=" . ($pageNum + 2) . "\">" . ($pageNum + 2) . "</a>";
}


$x += 2; // for forward
echo "<a href=\"index.php?p=$x\">&raquo;</a>";

echo "</div>";
?>
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
        $item = $projectsResponse[$actualNum];
        if ($item != null) {
            echo "
            <a href=\"" . $item['link'] . "\" class=\"item\">
                <div class=\"picture\">
                    <img alt=\"Image of the game\" src=\"img/" . $item['img'] . "\">
                </div>
                <h3 class=\"item-head\">" . $item['name'] . "</h3>
                <p class=\"item-text\">" . $item['blurb'] . "</p>
                <p class=\"date\">" . $item['date'] . "</p>
            </a>";
        }
    }

    echo "</div>";
    ?>

</div>


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
        <a href=\"index.php?p=" . ($pageNum - 2) . "\">" . ($pageNum - 2) . "</a>
        <a href=\"index.php?p=" . ($pageNum - 1) . "\">" . ($pageNum - 1) . "</a>
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