<template>
  <div class="message-container">
    <div class="message-box" @click="emitPasteMessage">
      <q-icon class="box-icon" :name="icon" :color="icon_color" />
      <p class="message-text">{{ text }}</p>
    </div>
  </div>
</template>

<script>
export default {
  props: ["text", "icon", "icon_color"],
  methods: {
    emitPasteMessage() {
      console.log("Emitting paste-message with text:", this.text); // Debugging log
      this.$emit("paste-message", this.text); // Send event to parent
    }
  }
};
</script>

<style scoped>
/* Wrapper container to align message boxes */
.message-container {
  display: flex;
  flex-direction: row; /* Ensure horizontal alignment */
  justify-content: center;
  width: 100%;
  gap: 10px; /* Add some spacing between the boxes */
  flex-wrap: wrap; /* Allow wrapping if the container is too small */
}

/* Message box styling */
.message-box {
  cursor: pointer;
  padding: 15px 20px;
  border-radius: 10px;
  background-color: white;
  display: flex;
  align-items: center;
  gap: 10px;
  border: 2px solid black;  /* Added border */
  width: 280px;  /* Set a fixed width */
  height: 60px;  /* Set a fixed height */
  text-align: center;
  justify-content: center;
  box-shadow: 3px 3px 10px rgba(0, 0, 0, 0.2); /* Added shadow for depth */
  transition: 0.3s;
}

/* Hover effect */
.message-box:hover {
  background-color: #e2e3e5;
  transform: scale(1.05);
}

/* Text styling */
.message-text {
  font-size: 16px;
  font-weight: 600;
  color: black;
}

/* Icon styling */
.box-icon {
  font-size: 24px;
}
</style>
