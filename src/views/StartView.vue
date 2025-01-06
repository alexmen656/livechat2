<template>
    <div class="start-view">
      <h1>Pirate Live Chat</h1>
      <input v-model="username" placeholder="Enter your username" />
      <button @click="startChat">Start</button>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        username: "",
      };
    },
    created() {
      const storedUsername = localStorage.getItem("username");
      if (storedUsername) {
        this.$router.push("/room/1/");
      }
    },
    methods: {
      startChat() {
        if (this.username.trim() !== "") {
          localStorage.setItem("username", this.username);
          this.$router.push("/room/1/");
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