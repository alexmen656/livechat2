<template>
  <router-view></router-view>
</template>

<script>
export default {
  name: "App",
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
  font-family: ui-sans-serif, system-ui, sans-serif, Apple Color Emoji,
    Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji;
  background: url("@/bg.png") no-repeat center center fixed;
  background-size: cover;
}
</style>
