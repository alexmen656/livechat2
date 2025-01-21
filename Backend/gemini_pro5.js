require("dotenv").config();
const axios = require("axios");
const fs = require("fs");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

const generationConfig = {
  maxOutputTokens: 150,
};

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig,
});

(async () => {
  setInterval(() => {
    logik("1");
  }, 2000);
  setInterval(() => {
    logik("2");
  }, 2000);
  setInterval(() => {
    logik("3");
  }, 2000);
  setInterval(() => {
    logik("4");
  }, 2000);
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
  const prompt = `You are 'AI' in a public chat. Based on the provided chat history: "${messageText}", respond only when addressed or if the context clearly requires your input. Be slightly humorous if appropriate. If the message is clearly directed at someone else or irrelevant to you, respond with an empty string (''). 

    Your responses must:
    - Be pure JSON in the format: {"response": "<response>"}
    - be a answer to only the last message!
    - Contain at most 130 characters (including spaces).
    - Be empty if no response is needed.
    - Never repeat yourself!
    
    Examples:
    1. If someone writes "Hello Xerox!", respond: {"response": ""}
    2. If the message is "AI, tell me a joke!", respond appropriately but within 130 characters.
    3. If the message is adreesed to all like "How are you guys?", respond appropriately but within 130 characters.
    4. If someone writes "How are you Xerox?", respond: {"response": ""}
    5. If someone writes "Shut up AI!", respond: {"response": ""}
    6. If someone writes "AI please do not respond!", respond: {"response": ""}
    7. If someone writes "I like football and you, Joe?", respond: {"response": ""}
    8. If someone writes "How are you Joe", then Joe answers "I am good and you?", respond: {"response": ""}
    9. If someone writes "Is somebody here?", respond appropriately but within 130 characters.
    10. If someone writes "How are you Martin?", respond: {"response": ""}
`;

  prompts.push(prompt);
  //    - not be empty if the last message is adresses to all users.

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
