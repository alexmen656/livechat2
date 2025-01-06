require("dotenv").config();
const axios = require("axios");
const fs = require("fs");

const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

const generationConfig = {
  maxOutputTokens: 50,
};

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig,
});

(async () => {
  // Das Skript läuft kontinuierlich in regelmäßigen Abständen
  setInterval(async () => {
    let lastMessageId = loadLastMessageId(); // Variable zur Überwachung der letzten Nachricht

    try {
      const messages = await fetchMessages();

      // Prüfe, ob neue Nachrichten vorhanden sind
      const lastID = messages.length - 1;
      if (
        messages.length > 0 &&
        messages[lastID].id !== lastMessageId &&
        messages[lastID].author !== "AI"
      ) {
        console.log("Neue Nachrichten gefunden!");
        // Setze die letzte Nachrichten-ID
        lastMessageId = messages[lastID].id;
        saveLastMessageId(lastMessageId);
        // Erstelle personalisierte Prompts
        const personalizedPrompts = createPersonalizedPrompts(messages);

        for (const prompt of personalizedPrompts) {
          // Generiere die Antwort
          const result = await model.generateContent([prompt]);
          const generatedText = result.response.text();
          console.log("Generierter Text:", generatedText);

          // Sende die Antwort an das PHP-Endpoint
          await sendResponseToEndpoint(generatedText);
        }
      }
    } catch (error) {
      console.error("Fehler bei der Generierung:", error.message);
    }
  }, 5000); // Alle 5 Sekunde
})();

async function fetchMessages() {
  try {
    const response = await axios.get(
      "https://alex.polan.sk/livechat/livechat.php"
    );
    return response.data; // Assuming the PHP script returns a JSON object with a "messages" array
  } catch (error) {
    console.error("Error fetching messages:", error);
    return [];
  }
}

function createPersonalizedPrompts(messages) {
  const prompts = [];
  // Nachrichten nach Autoren gruppieren
  //const authorsMessages = groupMessagesByAuthor(messages);
  //console.log(authorsMessages);
  // Erstellen der personalisierten Prompts für jeden Autor
    const messageText = messages
      .map((msg) => msg.author + ": " + msg.message)
      .join(" ");
    const prompt = `Basierend auf den Chatverlauf "${messageText}", antworte ihm passend zum Kontext. Dein Name ist 'AI' und dU bist nicht der einzige im chat er ist öffentlich, dass heisst wenn jemand uber 'ihr' spricht meint er dich und wenn anderen. Der Author einer Nachricht ist immer so  <author: <nachricht> markiert. Du schreibst ddass aber bitte nicht dazu das macht dass system automatisch. Ich antworte ihm maximal 50 wörtern.`;
    prompts.push(prompt);
  

  return prompts;
}

/*function groupMessagesByAuthor(messages) {
  return messages.reduce((acc, message) => {
    if (!acc[message.author]) {
      acc[message.author] = [];
    }
    acc[message.author].push(message);
    return acc;
  }, {});
}*/

async function sendResponseToEndpoint(responseText) {
  try {
    const data = {
      author: "AI", // Setze den Absender auf "AI" oder auf den jeweiligen Autor, je nach Bedarf
      message: responseText,
      type: "response", // Der Typ kann "response" oder ein anderer Wert sein, um die Nachricht zu kennzeichnen
    };

    const apiUrl = "https://alex.polan.sk/livechat/livechat.php"; // Dein PHP-Endpoint
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
    fs.writeFileSync("lastID.txt", id, "utf8");
  } catch (error) {
    console.error("Error writing to lastID.txt:", error);
  }
}
