<template>
  <div class="heading">
    <h1>{{ headingText }}</h1>
    <div class="rooms">
      <router-link
        :class="$route.params.roomId == '1' ? 'active' : ''"
        to="/room/1/"
        >Room 1</router-link
      >
      |
      <router-link
        :class="$route.params.roomId == '2' ? 'active' : ''"
        to="/room/2/"
        >Room 2</router-link
      >
      |
      <router-link
        :class="$route.params.roomId == '3' ? 'active' : ''"
        to="/room/3/"
        >Room 3</router-link
      >
      |
      <router-link
        :class="$route.params.roomId == '4' ? 'active' : ''"
        to="/room/4/"
        >Room 4</router-link
      >
      |
      <router-link
        :class="$route.params.roomId == '5' ? 'active' : ''"
        to="/room/5/"
        >Room 5</router-link
      >
    </div>
    <!-- <hr style="width: 100%;">-->
  </div>
</template>
<script>
export default {
  data() {
    return {
      headingText: "Pirate Live Chat",
    };
  },
  created() {
    this.updateHeadingText();
    window.addEventListener("resize", this.updateHeadingText);
  },
  methods: {
    updateHeadingText() {
      if (window.matchMedia("(max-width: 600px)").matches) {
        this.headingText = "Pirate LC";
      } else {
        this.headingText = "Pirate Live Chat";
      }
    },
  },
};
</script>
<style scoped>
.heading {
  display: flex;
  /* flex-direction: column;*/
  justify-content: space-between;
  align-items: center;
  padding: 10px;
}

@media (max-width: 600px) {
  .heading {
    flex-direction: column;
  }

  .rooms {
    margin-top: 10px;
  }
}

.heading > h1 {
  font-size: 48px;
  color: white;
  text-shadow: 2px 2px 2px rgba(0, 0, 0, 0.5);
  margin: 0;
}

.rooms {
  display: flex;
  justify-content: center;
  color: white;
}

.rooms > a {
  font-size: 1.25rem;
  color: white;
  text-decoration: none;
  margin: 0 10px;
}

.rooms > a.active {
  color: red;
}
</style>
