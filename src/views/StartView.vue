<template>
  <div class="start-view">
    <h1>Pirate Live Chat</h1>
    <input v-model="username" placeholder="Enter your username" />
    <button @click="startChat">Start</button>
  </div>
</template>

<script scoped>
export default {
  data() {
    return {
      username: "",
    };
  },
  created() {
    const storedUsername = localStorage.getItem("username");
    const verificationId = localStorage.getItem("verification_id");
    if (storedUsername && verificationId) {
      this.$router.push("/room/1/");
    }
  },
  methods: {
    async startChat() {
      if (this.username.trim() !== "") {
        try {
          const response = await this.$axios.post("register.php", {
            username: this.username,
          });
          if (response.data.status === "success") {
            if (response.data.verification_id) {
              localStorage.setItem(
                "verification_id",
                response.data.verification_id
              );
            }
            localStorage.setItem("username", this.username);
            this.$router.push("/room/1/");
          } else {
            alert("Error registering user: " + response.data.message);
          }
        } catch (error) {
          console.error("Error registering user:", error);
          alert("An error occurred while registering. Please try again.");
        }
      } else {
        alert("Please enter a username");
      }
    },
  },
};
</script>

<style>
.start-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: url("@/bg.png") no-repeat center center fixed;
  background-size: cover;
}

h1 {
  font-family: "Blackpearl", sans-serif;
  color: white;
  margin-bottom: 20px;
}

input {
  padding: 10px;
  font-size: 16px;
  margin-bottom: 10px;
  border-radius: 5px;
  border: 1px solid #ccc;
}

button {
  padding: 10px 20px;
  font-size: 16px;
  border: none;
  border-radius: 5px;
  background-color: #007bff;
  color: white;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}
</style>
