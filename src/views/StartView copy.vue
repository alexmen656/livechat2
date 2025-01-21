<template>
  <div class="start-view">
    <div class="overlay"></div>
    <div class="content">
      <h1>Pirate Live Chat</h1>
      <input v-model="username" placeholder="Enter your username" />
      <button @click="startChat">Start</button>
    </div>
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

<style scoped>
.start-view {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: url("@/bg.png") no-repeat center center fixed;
  background-size: cover;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1;
}

.content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2), 0 6px 20px rgba(0, 0, 0, 0.2);
  margin: 10px;
}

h1 {
  font-family: "Blackpearl", sans-serif;
  color: #333;
  margin-bottom: 40px;
  font-size: 48px;
  margin-top: 10px;
  text-align: center;
}

input {
  padding: 10px;
  font-size: 16px;
  margin-bottom: 10px;
  border-radius: 5px;
  border: 1px solid #ccc;
  width: 100%;
  display: block;
  box-sizing: border-box;
  /*max-width: 300px;*/
}

button {
  padding: 10px 20px;
  font-size: 16px;
  border: none;
  border-radius: 5px;
  background-color: #007bff;
  color: white;
  cursor: pointer;
  width: 100%;
 /* max-width: 300px;*/
}

button:hover {
  background-color: #0056b3;
}
</style>