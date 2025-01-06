<!--<template>
  <img alt="Vue logo" src="./assets/logo.png">
  <HelloWorld msg="Welcome to Your Vue.js App"/>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue'

export default {
  name: 'App',
  components: {
    HelloWorld
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>-->

<template>
  <h1>Pirate Live Chat</h1>
  <router-link to="/room/1/">Room 1</router-link> |
  <router-link to="/room/2/">Room 2</router-link> |
  <router-link to="/room/3/">Room 3</router-link> |
  <div class="live-chat">
    <div class="messages">
      <div v-for="message in messages" :key="message.id" :class="message.type">
        <span class="author">{{ message.author }}: </span>
        <span class="text">{{ message.message }}</span>
      </div>
    </div>
    <div class="input-container">
      <input
        type="text"
        v-model="newMessage"
        placeholder="Type your message"
        @keyup.enter="sendMessage"
      />
      <button @click="sendMessage">Send</button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      messages: [],
      newMessage: "",
    };
  },
  created() {
    const storedUsername = localStorage.getItem("username");
    if (!storedUsername) {
      this.$router.push("/");
    }

    this.fetchMessages();
    setInterval(() => {
      this.fetchMessages();
    }, 1000);
  },
  methods: {
    fetchMessages() {
      this.$axios
        .get("livechat.php")
        .then((response) => {
          this.messages = response.data;
        })
        .catch((error) => {
          console.error("Error fetching messages:", error);
        });
    },
    sendMessage() {
      if (this.newMessage.trim() !== "") {
        const message = {
          author: localStorage.getItem("username") ?? "User",
          message: this.newMessage,
          type: "user",
        };
        this.$axios
          .post("livechat.php", message)
          .then((response) => {
            if (response.data.status === "success") {
              this.fetchMessages();
              this.newMessage = "";
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

<style>
@font-face {
  font-family: "Blackpearl";
  src: url("@/Blackpearl.ttf") format("truetype");
  font-weight: normal;
  font-style: normal;
}

body,
html,
#app {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  font-family: "Blackpearl", sans-serif !important;
  background: url("@/bg.png") no-repeat center center fixed;
  background-size: cover;
}

.live-chat {
  display: flex;
  flex-direction: column;
  height: 80%;
  width: 100%;
  border: 1px solid #ccc;
  border-radius: 5px;
  overflow: hidden;
  /* background: url("@/bg2.webp") no-repeat center center fixed;*/
  background-color: white;
  background-size: cover;
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

.user {
  color: blue;
}

.system {
  color: green;
}

.input-container {
  display: flex;
  padding: 10px;
  border-top: 1px solid #ccc;
}

input[type="text"] {
  flex: 1;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

button {
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  margin-left: 10px;
}

h1 {
  text-align: center;
}
</style>
