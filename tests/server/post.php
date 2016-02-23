<?php
    $response = "";

    $response .= "\n\n\nPOST\n";
    forEach($_POST as $key => $value) {
        $response .= "Key: " . $key . " value: " . $value . "\n";
    }

    $response .= "\n\n\nGET\n";
    forEach($_GET as $key => $value) {
        $response .= "Key: " . $key . " value: " . $value . "\n";
    }

    $response .= "\n\n\nCOOKIES\n";
    forEach($_COOKIE as $key => $value) {
        $response .= "Key: " . $key . " value: " . $value . "\n";
    }

    $response .= "\n\n\nHeaders\n";
    foreach (getallheaders() as $key => $value) {
        $response .= "Key: " . $key . " value: " . $value . "\n";
    }

    echo $response;
