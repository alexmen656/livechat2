require("dotenv").config();
const axios = require("axios");
const fs = require("fs");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

const generationConfig = {
  maxOutputTokens: 70,
};

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig,
});

(async () => {
  setInterval(() => {
    logik("1");
  }, 5000);
  setInterval(() => {
    logik("2");
  }, 5000);
  setInterval(() => {
    logik("3");
  }, 5000);
  setInterval(() => {
    logik("4");
  }, 5000);
})();

async function logik(roomId) {
  console.log("Checking for new messages in room", roomId);
  let lastMessageId = loadLastMessageId();

  try {
    const messages = await fetchMessages(roomId);
    const lastID = messages.length - 1;

    if (
      messages.length > 0 &&
      messages[lastID].id !== lastMessageId &&
      messages[lastID].author !== "AI"
    ) {
      console.log("New messages found!");
      lastMessageId = messages[lastID].id;
      saveLastMessageId(lastMessageId);
      const personalizedPrompts = createPersonalizedPrompts(messages);

      for (const prompt of personalizedPrompts) {
        const result = await model.generateContent([prompt]);
        const generatedText = result.response.text();
        console.log("Generated text:", generatedText);

        await sendResponseToEndpoint(generatedText, roomId);
      }
    }
  } catch (error) {
    console.error("Fehler bei der Generierung:", error.message);
  }
}

async function fetchMessages(roomId) {
  try {
    const response = await axios.get(
      "https://alex.polan.sk/livechat/livechat.php?room_id=" + roomId + "&verification_id=" + process.env.VERIFICATION_ID
    );
    return response.data.messages;
  } catch (error) {
    console.error("Error fetching messages:", error);
    return [];
  }
}

function createPersonalizedPrompts(messages) {
  const prompts = [];
  const messageText = messages
    .map((msg) => msg.author + ": " + msg.message)
    .join(" ");
  const prompt = `Based on this chat history "${messageText}", reply in the correct context and be a bit funny. Your name is 'AI' and your in a public chat. When somebody writes/asks something what is not mentioned for you, your answer will be ''. So if for example somewhere wirtes: Hello Xerox! Then your answer is ''.`;
  prompts.push(prompt);

  return prompts;
}

async function sendResponseToEndpoint(responseText, roomId) {
  try {
    const data = {
      author: "AI",
      message: responseText.replaceAll("<AI: ", "").replaceAll("AI: ", ""),
      type: "response",
      room_id: roomId,
      verification_id: process.env.VERIFICATION_ID,
    };

    const apiUrl = "https://alex.polan.sk/livechat/livechat.php";
    const response = await axios.post(apiUrl, data);

    if (response.data.status === "success") {
      console.log("Antwort erfolgreich gesendet!");
    } else {
      console.error("Fehler beim Senden der Antwort:", response.data.message);
    }
  } catch (error) {
    console.error(
      "Fehler beim Senden der Antwort an das Endpoint:",
      error.message
    );
  }
}
function loadLastMessageId() {
  try {
    const data = fs.readFileSync("lastID.txt", "utf8");
    return data.trim();
  } catch (error) {
    console.error("Error reading lastID.txt:", error);
    return null;
  }
}
function saveLastMessageId(id) {
  try {
    fs.writeFileSync("lastID.txt", String(id), "utf8");
  } catch (error) {
    console.error("Error writing to lastID.txt:", error);
  }
}
