<template>
  <div class="chat-view">
    <div class="overlay"></div>

    <div class="inner">
      <SiteHeading></SiteHeading>
      <hr />
      <div class="live-chat">
        <div class="messages">
          <div
            v-for="message in messages"
            :key="message.id"
            :class="message.type ? message.type : 'response'"
          >
            <span class="author" :class="message.color"
              >{{ message.author }}:
            </span>
            <span class="text">{{ message.message }}</span>
          </div>
          <div class="no-messages" v-if="messages.length == 0">
            No messages yet. Be the first to say something!
          </div>
        </div>
        <div class="input-container">
          <!--  Username: Xerox -->
          <div class="inner-container">
            <input
              type="text"
              v-model="newMessage"
              placeholder="Type your message"
              @keyup.enter="sendMessage"
            />
            <button @click="sendMessage">Send</button>
          </div>
          <span class="room5-note">
            PS: In Room 5 there is no AI! Only real people :)</span
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SiteHeading from "@/components/SiteHeading.vue";

export default {
  components: {
    SiteHeading,
  },
  data() {
    return {
      messages: [],
      newMessage: "",
    };
  },
  created() {
    const storedUsername = localStorage.getItem("username");
    const verificationId = localStorage.getItem("verification_id");
    if (!storedUsername || !verificationId) {
      this.$router.push("/");
    }

    this.fetchMessages();
    setInterval(() => {
      this.fetchMessages();
    }, 1000);
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.updateHeadingText);
  },
  methods: {
    fetchMessages() {
      const roomId = this.$route.params.roomId;
      this.$axios
        .get("livechat.php?room_id=" + roomId)
        .then((response) => {
          this.messages = response.data;
        })
        .catch((error) => {
          console.error("Error fetching messages:", error);
        });
    },
    sendMessage() {
      if (this.newMessage.trim() !== "") {
        const roomId = this.$route.params.roomId;
        const message = {
          author: localStorage.getItem("username") ?? "User",
          message: this.newMessage,
          type: "user",
          room_id: roomId,
          verification_id: localStorage.getItem("verification_id"),
        };
        this.$axios
          .post("livechat.php", message)
          .then((response) => {
            if (response.data.status === "success") {
              this.fetchMessages();
              this.newMessage = "";
            } else if (response.data.status === "error") {
              alert(
                "Message could not be send!\nError: " + response.data.message
              );
            }
          })
          .catch((error) => {
            console.error("Error sending message:", error);
          });
      }
    },
  },
};
</script>

<style scoped>
.live-chat {
  display: flex;
  flex-direction: column;
  height: 89%;
  border-radius: 5px;
  overflow: hidden;
  z-index: 1000;
  padding: 0 10px;
}

.inner {
  z-index: 1000;
  height: 100%;
  width: 100%;
}

.messages {
  flex: 1;
  padding: 10px;
  height: 80%;
  overflow-y: auto;
}

.message {
  margin-bottom: 10px;
}

.text {
  color: white;
}

.input-container {
  display: flex;
  flex-direction: column;
  padding: 10px;
  background: rgba(12, 12, 12, 0.85);
  border-radius: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.7), 0 6px 20px rgba(0, 0, 0, 0.7);
  width: 100%;
}

input {
  flex: 1;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 10px !important;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  width: 90%;
}

button {
  font-size: 12px;
  border: none;
  border-radius: 5px;
  background-color: rgba(0, 123, 255, 0.8);
  color: white;
  cursor: pointer;
  height: 100%;
  width: 5%;
}

button:hover {
  background-color: rgba(0, 86, 179, 0.8);
}

input[type="text"] {
  flex: 1;
  padding: 10px;
  font-size: 16px;
  border: 1px solid black;
  border-radius: 5px;
  background: black;
  color: #fff;
}

h1 {
  text-align: center;
}

.chat-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  overflow: hidden;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(12, 12, 12, 0.9);
  z-index: 1;
}

.text,
.author {
  font-size: 1.25rem;
}

.response,
.user {
  margin-bottom: 10px;
}

.room5-note {
  color: #fff;
  text-align: center;
}

.inner-container {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: space-between;
}

.no-messages {
  color: white;
  text-align: center;
  margin-top: 10px;
  font-size: 1.5rem;
}

hr {
  margin-top: 0 !important;
}

.red {
  color: red;
}

.blue {
  color: blue;
}

.green {
  color: green;
}

.purple {
  color: purple;
}

.orange {
  color: orange;
}

.pink {
  color: pink;
}

.yellow {
  color: yellow;
}

.cyan {
  color: cyan;
}

.magenta {
  color: magenta;
}

.lime {
  color: lime;
}

.brown {
  color: brown;
}
</style>
