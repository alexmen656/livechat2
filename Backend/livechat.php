<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: *');
header('Access-Control-Allow-Methods: *');
header("Content-Type: application/json");
include 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

$colors = ['blue', 'green', 'purple', 'orange', 'pink', 'yellow', 'cyan', 'magenta', 'lime', 'brown'];

if ($method == 'GET') {
    // Fetch messages
    $room_id = isset($_GET['room_id']) ? intval($_GET['room_id']) : 1;

    // Fetch unique users in the room
    $sql = "SELECT DISTINCT author FROM messages WHERE room_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $room_id);
    $stmt->execute();
    $result = $stmt->get_result();

    $userColors = [];
    $index = 0;
    while ($row = $result->fetch_assoc()) {
        if ($row['author'] === 'AI') {
            $userColors[$row['author']] = 'red';
        } else {
            $userColors[$row['author']] = $colors[$index % count($colors)];
            $index++;
        }
    }
    $stmt->close();

    // Fetch messages with assigned colors
    $sql = "SELECT * FROM messages WHERE room_id = ? ORDER BY timestamp ASC";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $room_id);
    $stmt->execute();
    $result = $stmt->get_result();

    $messages = [];
    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $row['color'] = $userColors[$row['author']];
            $messages[] = $row;
        }
    }
    echo json_encode($messages);
    $stmt->close();
} elseif ($method == 'POST') {
    // Save a new message
    $data = json_decode(file_get_contents('php://input'), true);
    $author = $data['author'];
    $message = $data['message'];
    $type = $data['type'];
    $room_id = $data['room_id'];
    $verification_id = $data['verification_id'];

    // Verify the user
    $sql = "SELECT * FROM users WHERE username = ? AND verification_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ss", $author, $verification_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        // User is verified, save the message
        $sql = "INSERT INTO messages (author, message, type, room_id) VALUES (?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("sssi", $author, $message, $type, $room_id);

        if ($stmt->execute() === TRUE) {
            echo json_encode(['status' => 'success']);
        } else {
            echo json_encode(['status' => 'error', 'message' => $stmt->error]);
        }
    } else {
        // User verification failed
        echo json_encode(['status' => 'error', 'message' => 'Verification failed']);
    }
    $stmt->close();
}

$conn->close();
?>