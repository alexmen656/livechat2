<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: *');
header('Access-Control-Allow-Methods: *');
header("Content-Type: application/json");
include 'config.php';

function generateVerificationId($length = 16)
{
    return bin2hex(random_bytes($length / 2));
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method == 'POST') {
    // Get the input data
    $data = json_decode(file_get_contents('php://input'), true);
    $username = $data['username'];

    // Generate a verification ID
    $verificationId = generateVerificationId();

    // Save the user to the database
    $sql = "INSERT INTO users (username, verification_id) VALUES (?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ss", $username, $verificationId);

    if ($stmt->execute() === TRUE) {
        echo json_encode(['status' => 'success', 'verification_id' => $verificationId]);
    } else {
        echo json_encode(['status' => 'error', 'message' => $stmt->error]);
    }

    $stmt->close();
}

$conn->close();
?>