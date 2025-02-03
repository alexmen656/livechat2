<template>
  <div class="chat-view">
    <div class="overlay"></div>

    <div class="inner">
      <SiteHeading></SiteHeading>
      <hr />
      <div class="live-chat">
        <div class="messages" ref="messagesContainer" @scroll="handleScroll">
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
          <div
            class="new-messages-popup"
            v-if="newMessages"
            @click="scrollToBottom"
          >
            New Messages ↓
          </div>
          <div class="inner-container">
            <input
              type="text"
              v-model="newMessage"
              placeholder="Type your message"
              @keyup.enter="sendMessage"
            />
            <button @click="sendMessage">Send</button>
          </div>
          <div class="foot-notes">
            <span class="room5-note">
              Your current username: {{ username }}
            </span>
            <span class="room5-note">
              PS: In Room 5 there is no AI! Only real people :)</span
            >
          </div>
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
      old_messages: [],
      newMessage: "",
      username: localStorage.getItem("username") ?? "User",
      ticker1: 1,
      ticker2: 1,
      newMessages: false,
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
  watch: {
    "$route.params.roomId": function (newVal, oldVal) {
      if (newVal !== oldVal) {
        this.ticker2 = 1;
      }
    },
  },
  methods: {
    fetchMessages(scroll = true) {
      const roomId = this.$route.params.roomId;
      this.$axios
        .get("livechat.php?room_id=" + roomId)
        .then((response) => {
          /*  if (this.ticker1 == 1) {
            //alert(this.ticker1);
            this.scrollToBottom();
            this.ticker1++;
          }*/
          this.old_messages = this.messages;
          this.messages = response.data;
          /* if (this.ticker2 == 1) {
            this.scrollToBottom();
            this.ticker2++;
          }*/
        })
        .then(() => {
          const container = this.$refs.messagesContainer;

          if (this.ticker2 == 1 || !scroll) {
            this.scrollToBottom();
            this.ticker2++;
          } else if (
            this.old_messages.length != this.messages.length &&
            scroll &&
            container.scrollHeight > container.clientHeight
          ) {
            // alert(container.scrollTop + " + " + container.scrollHeight);
            this.newMessages = true;
          }
        })
        .catch((error) => {
          console.error("Error fetching messages:", error);
        });
    },
    scrollToBottom() {
      const container = this.$refs.messagesContainer;
      container.scrollTop = container.scrollHeight;
      this.handleScroll();
    },
    handleScroll() {
      const container = this.$refs.messagesContainer;
      if (
        container.scrollTop + container.clientHeight >=
        container.scrollHeight - 2
      ) {
        this.newMessages = false;
      }
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
              this.fetchMessages(false);
              const container = this.$refs.messagesContainer;
              container.scrollTop = container.scrollHeight;
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
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3), 0 6px 20px rgba(0, 0, 0, 0.3);
  position: relative;
}

button {
  font-size: 1 16px;
  border: none;
  border-radius: 5px;
  background-color: rgba(0, 123, 255, 0.8);
  color: white;
  cursor: pointer;
  width: 5%;
  margin-bottom: 10px;
}

button:hover {
  background-color: rgba(0, 86, 179, 0.8);
}

input[type="text"] {
  flex: 1;
  padding: 10px;
  font-size: 16px;
  border: none;
  background: black;
  color: white;
  border-radius: 10px !important;
  margin-right: 10px;
  box-sizing: border-box;
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

.foot-notes {
  display: flex;
}

.room5-note {
  color: #fff;
  text-align: center;
  display: block;
  width: 50%;
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

.new-messages-popup {
  position: absolute;
  top: -50px;
  left: 50%;
  transform: translateX(-50%);
  background-color: black;
  color: red;
  padding: 5px 10px;
  border-radius: 5px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4), 0 6px 20px rgba(0, 0, 0, 0.4);
  z-index: 1001;
  font-size: 24px;
  cursor: pointer;
}
</style>
