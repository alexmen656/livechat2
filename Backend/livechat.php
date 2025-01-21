<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: *');
header('Access-Control-Allow-Methods: *');
header("Content-Type: application/json");
include 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method == 'GET') {
    $room_id = $_GET['room_id'];
    $verification_id = $_GET['verification_id'];
    $sql = "SELECT * FROM users WHERE verification_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $verification_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();
        $user_id = $user['id'];

        // Update online status
        $sql = "INSERT INTO user_online_status (user_id, is_online, last_active) VALUES (?, TRUE, NOW())
                ON DUPLICATE KEY UPDATE is_online = TRUE, last_active = NOW()";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $user_id);
        $stmt->execute();
        $stmt->close();

        // Fetch messages with user profile pictures
        $sql = "SELECT messages.*, users.avatar FROM messages 
            JOIN users ON messages.author = users.username 
            WHERE room_id = ? ORDER BY timestamp ASC";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $room_id);
        $stmt->execute();
        $result = $stmt->get_result();

        $messages = [];
        if ($result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                $messages[] = $row;
            }
        }


        // Fetch the number of online users
        $sql = "SELECT COUNT(DISTINCT user_id) as online_count FROM user_online_status 
                WHERE last_active > NOW() - INTERVAL 10 SECOND";//30 
        $result = $conn->query($sql);
        $online_count = $result->fetch_assoc()['online_count'];

        echo json_encode(['messages' => $messages, 'online_count' => $online_count]);
        $stmt->close();
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Missing Authorization']);
    }
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
        $sql = "INSERT INTO messages (author, message, type, room_id) VALUES (?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("sssi", $author, $message, $type, $room_id);

        if ($stmt->execute() === TRUE) {
            echo json_encode(['status' => 'success']);
        } else {
            echo json_encode(['status' => 'error', 'message' => $stmt->error]);
        }

        $stmt->close();
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Missing Authorization']);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method']);
}

$conn->close();
?>