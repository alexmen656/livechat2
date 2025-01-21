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
  /*setInterval(() => {
    logik("1");
  }, 5000);
  setInterval(() => {
    logik("2");
  }, 5000);*/
  setInterval(() => {
    logik("3");
  }, 5000);
  /* setInterval(() => {
    logik("4");
  }, 5000);*/
})();

async function logik(roomId) {
  console.log("Checking for new messages in room", roomId);
  let lastMessageId = loadLastMessageId(roomId);

  try {
    const messages = await fetchMessages(roomId);
    const lastID = messages.length - 1;

    //console.log(messages[lastID].id + " + " + lastMessageId);
    if (
      messages.length > 0 &&
      messages[lastID].id !== Number(lastMessageId) &&
      messages[lastID].author !== "AI"
    ) {
      console.log("New messages found!");
      lastMessageId = messages[lastID].id;
      saveLastMessageId(roomId, lastMessageId);
      const personalizedPrompts = createPersonalizedPrompts(messages);

      for (const prompt of personalizedPrompts) {
        const result = await model.generateContent([prompt]);
        console.log("Generated text:", result.response.text());
        const generatedText = result.response
          .text()
          .replaceAll("```json", "")
          .replaceAll("```", "");
        console.log("Generated text:", JSON.parse(generatedText));
        const generatedText2 = JSON.parse(generatedText);
        await sendResponseToEndpoint(generatedText2, roomId);
      }
    }
  } catch (error) {
    console.error("Fehler bei der Generierung:", error.message);
  }
}

async function fetchMessages(roomId) {
  try {
    const response = await axios.get(
      "https://alex.polan.sk/livechat/livechat.php?room_id=" +
        roomId +
        "&verification_id=" +
        process.env.VERIFICATION_ID
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
  const prompt = `Based on this chat history "${messageText}", reply, but only if needed in the correct context and be a bit funny. Your name is 'AI' and your in a public chat. When somebody writes/asks something what is not mentioned for you, your answer will be ''. So if for example somewhere wirtes: Hello Xerox! Then your answer is ''. You answer must be pure json in  this format: {"response": "<response>"}, but remember you can let it empty! You are answer can have up to 30 characters maximum! When someone is not talking with you, shut up! `;
  prompts.push(prompt);

  return prompts;
}

async function sendResponseToEndpoint(responseText, roomId) {
  try {
    console.log(responseText);
    if (responseText?.response.trim()) {
      const data = {
        author: "AI",
        message: responseText.response
          .replaceAll("<AI: ", "")
          .replaceAll("AI: ", ""),
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
    } else {
      console.log("Ich werde nicht antworten!");
    }
  } catch (error) {
    console.error(
      "Fehler beim Senden der Antwort an das Endpoint:",
      error.message
    );
  }
}
function loadLastMessageId(roomId) {
  try {
    const data = fs.readFileSync("lastID_" + roomId + ".txt", "utf8");
    return data.trim();
  } catch (error) {
    console.error("Error reading lastID_" + roomId + ".txt:", error);
    return null;
  }
}
function saveLastMessageId(roomId, id) {
  try {
    console.log("Saving last message ID:" + " lastID_" + roomId + ".txt");
    fs.writeFileSync("lastID_" + roomId + ".txt", String(id), "utf8");
  } catch (error) {
    console.error("Error writing to lastID_" + roomId + ".txt:", error);
  }
}
