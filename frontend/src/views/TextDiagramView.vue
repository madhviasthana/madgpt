<template>
  <main class="home-container">
    <div class="q-pa-m">
      <q-layout class="shadow-2 rounded-borders">
        <q-header elevated style="background-color: #1e1e2e">
          <q-toolbar>
            <q-btn flat @click="drawer = !drawer" round dense icon="menu" />
            <q-toolbar-title @click="gotohome" style="cursor: pointer"
              >TextToDiagram</q-toolbar-title
            >
          </q-toolbar>
        </q-header>

        <q-drawer
          v-model="drawer"
          :width="200"
          :breakpoint="500"
          bordered
          style="background-color: #1e1e2e"
        >
          <q-select
            outlined
            dark
            behavior="dialog"
            v-model="selected_model"
            :options="options"
            label="Select Model"
          />
          <q-btn dark @click="gototexttodiagram">Text To Diagram</q-btn>
        </q-drawer>

        <q-page-container class="page-content">
          <div class="chat-window">
            <div class="chat-area">
              <q-scroll-area class="fit" ref="chatScroll">
                <div class="headtext" v-if="messages.length === 0">
                  <h2 class="welcome-heading">Welcome to TextToDiagram</h2>
                  <h5 class="subtitle">Create any diagram with Ease! 🚀</h5>

                  <div class="welcome-msg">
                    <MessageBox
                      text="Generate a decision tree for loan approval"
                      icon="school"
                      icon_color="blue"
                      @paste-message="pasteText"
                    />
                    <MessageBox
                      text="Show a timeline for a product development cycle"
                      icon="edit"
                      icon_color="yellow"
                      @paste-message="pasteText"
                    />
                    <MessageBox
                      text="Draw logic for Dkjistra Algorithm."
                      icon="lightbulb"
                      icon_color="orange"
                      @paste-message="pasteText"
                    />
                    <MessageBox
                      text="Draw a flowchart for an online order process"
                      icon="flight"
                      icon_color="green"
                      @paste-message="pasteText"
                    />
                  </div>
                </div>

                <div
                  v-for="(message, index) in messages"
                  :key="index"
                  style="color: #1e1e2e; width: 100%"
                >
                  <q-chat-message
                    v-if="message['type'] === 'user'"
                    name="me"
                    sent
                    text-color="white"
                    bg-color="blue-7"
                    class="user-text"
                  >
                    <div class="chat-text">{{ message["message"] }}</div>
                  </q-chat-message>

                  <q-chat-message
                    v-if="message['type'] === 'gpt'"
                    :name="message['label']"
                    class="chat-bubble-ai chat-message-container"
                    style="color: #1e1e2e"
                    bg-color="grey-4"
                  >
                    <div
                      v-if="message['message'].length > 0"
                      class="chat-text"
                      ref="codeContainer"
                      v-html="message['message']"
                    />

                    <!-- <q-spinner-dots size="2rem" /> -->
                    <div class="diagram" v-if="message['graph'].length > 0">
                      <VueMermaidRender :content="message['graph']" />
                    </div>
                  </q-chat-message>
                </div>
                <!-- avatar="https://geeksgod.com/wp-content/uploads/2021/05/Logopit_1603470318463-300x300.png"
                   -->
                <q-chat-message
                  v-if="message_procession"
                  name="MadGPT"
                  class="chat-bubble-ai"
                  bg-color="grey-4"
                >
                  <q-spinner-dots size="2rem" />
                </q-chat-message>
                <q-scroll-observer />
              </q-scroll-area>
            </div>

            <div class="chat-text-box">
              <q-form @submit="onSubmit" @reset="onReset" class="q-gutter-md">
                <q-input
                  rounded
                  outlined
                  borderless
                  clearable
                  ref="chatInput"
                  class="chat-input"
                  :bg-color="auth_required ? 'red-4' : 'grey-4'"
                  v-model="message"
                  type="text"
                  autogrow
                  :placeholder="
                    auth_required
                      ? 'Provide Your Super Secret Code'
                      : 'Ask your Amazing Question?'
                  "
                >
                  <template v-slot:append>
                    <q-icon
                      v-if="auth_required"
                      :name="isPwd ? 'visibility_off' : 'visibility'"
                      class="cursor-pointer"
                      @click="isPwd = !isPwd"
                    />
                    <q-btn
                      class="send-button"
                      round
                      dense
                      unelevated
                      icon="send"
                      color="black"
                      type="submit"
                      @click="get_response()"
                    />
                  </template>
                </q-input>
              </q-form>
            </div>
          </div>
        </q-page-container>
      </q-layout>
    </div>
  </main>
</template>

<script>
import { inject, ref } from "vue";
import { marked } from "marked";
import MessageBox from "../components/MessageBox.vue";
import { useQuasar } from "quasar";
import hljs from "highlight.js";
import "highlight.js/styles/tomorrow-night-blue.css"; // Choose your preferred theme
import { VueMermaidRender } from "vue-mermaid-render";

export default {
  setup() {
    const $q = useQuasar();

    return {
      message: ref(""),
      showNotif(msg) {
        $q.notify({
          position: "top",
          message: "Server Error : " + msg,
          color: "red",
        });
      },
    };
  },

  components: { MessageBox, VueMermaidRender },
  mounted() {
    this.focusInput();
  },

  created() {
    var uniqueId = this.generateUniqueId();

    // Store the new unique ID in session storage
    sessionStorage.setItem("uniqueId", uniqueId);

    console.log(uniqueId);
  },
  watch: {
    selected_model(newValue, oldValue) {
      this.auth_required = false;
    },
  },

  props: ["text", "icon", "icon_color"],

  methods: {
    gotohome() {
      window.location.href = "/";
    },
    gototexttodiagram() {
      window.location.href = "/text-to-diagram";
    },
    emitPasteMessage() {
      this.$emit("paste-message", this.text); // Emit event with text
    },
    pasteText(text) {
      this.message = text; // Update the v-model of q-input
      console.log(this.message);
      this.$nextTick(() => {
        if (this.$refs.chatInput) {
          this.$refs.chatInput.focus();
        }
      });
    },

    highlightCodeBlocks() {
      // Ensure this method is called after the DOM has updated
      this.$nextTick(() => {
        // Select all <pre><code> elements
        document.querySelectorAll("pre code").forEach((block) => {
          // Apply highlighting to each block
          hljs.highlightBlock(block);
        });
      });
    },
    modifyLinksToOpenInNewWindow(htmlContent) {
      // Create a temporary DOM element to parse the HTML
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = htmlContent;

      // Find all anchor tags
      const links = tempDiv.getElementsByTagName("a");

      // Modify each link
      Array.from(links).forEach((link) => {
        link.setAttribute("target", "_blank");
        link.setAttribute("rel", "noopener noreferrer");
      });

      // Return the modified HTML content
      return tempDiv.innerHTML;
    },
    extractYouTubeLinks(text) {
      const youtubeRegex =
        /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(?:embed\/)?(?:v\/)?(?:shorts\/)?(?:\S+)/g;
      return text.match(youtubeRegex) || [];
    },
    extractAndConvertYouTubeLinksHTML(htmlContent) {
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = htmlContent;

      const links = tempDiv.getElementsByTagName("a");

      return Array.from(links)
        .map((link) => link.href)
        .filter(
          (href) =>
            href.includes("youtube.com/watch") || href.includes("youtu.be/")
        )
        .map((href) => {
          let videoId;
          if (href.includes("youtube.com/watch")) {
            videoId = new URL(href).searchParams.get("v");
          } else if (href.includes("youtu.be/")) {
            videoId = href.split("youtu.be/")[1];
          }
          return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
        })
        .filter(Boolean); // Remove any null values
    },
    focusInput() {
      this.$refs.chatInput.focus();
    },
    getUniqueId() {
      // Define the key used to store the unique ID in session storage
      const uniqueIdKey = "uniqueId";

      // Check if the unique ID is already stored in session storage
      let uniqueId = sessionStorage.getItem(uniqueIdKey);

      // If the unique ID does not exist, generate a new one
      if (!uniqueId) {
        // Generate a new unique ID
        uniqueId = this.generateUniqueId();

        // Store the new unique ID in session storage
        sessionStorage.setItem(uniqueIdKey, uniqueId);
      }

      // Return the unique ID
      return uniqueId;
    },

    // Helper function to generate a new unique ID
    generateUniqueId() {
      return "id-" + Date.now() + "-" + Math.floor(Math.random() * 10000);
    },
    scrollToBottom() {
      const scrollArea = this.$refs.chatScroll;
      if (scrollArea && scrollArea.$el) {
        const scrollElement = scrollArea.$el.querySelector(
          ".q-scrollarea__container"
        );
        if (scrollElement) {
          scrollElement.scrollTop = scrollElement.scrollHeight;
        }
      }
    },

    async get_response() {
      var text = this.message.trim();
      var chat_msg = text;

      this.message = "";
      if (text !== "") {
        var u_id = this.getUniqueId();
        console.log(u_id);
        this.messages.push({ type: "user", message: chat_msg });
        this.message_procession = true;
        setTimeout(() => {
          this.scrollToBottom();
        }, 200);

        try {
          var response = await this.backend.getTextToDiagramResponse(
            text,
            u_id
          );

          if (response.status == 200) {
            console.log(response);

            var html_msg = this.renderedMarkdown(
              response.data["direct_response"]
            );
            html_msg = this.modifyLinksToOpenInNewWindow(html_msg);
            this.messages.push({
              type: "gpt",
              label: `TextToDiagram`,
              message: html_msg,
              graph: response.data["graph"],
            });

            this.auth_required = response.data["auth_required"];

            this.message = "";
            this.highlightCodeBlocks();
          }
        } catch (error) {
          // Handle the error
          console.error("Error : ", error);
          this.showNotif(error);
          this.messages.pop();
        }
        this.message_procession = false;
        this.focusInput();
      }
    },
    renderedMarkdown(text) {
      return marked(text);
    },
  },

  data() {
    return {
      auth_required: false,
      isPwd: true,
      options: [
        "llama-3.1-8b-instant",
        "llama-3.1-70b-versatile",
        "gpt-4o-mini",
        "gpt-4o",
        "gpt-4-turbo",
        "gpt-3.5-turbo",
        "gemma2-9b-it",
        "gemma-7b-it",

        "llama3-8b-8192",
      ],
      selected_model: "llama-3.1-8b-instant",
      llms: {
        "llama3-8b-8192": {
          llm: "GROQ",
          model_name: "llama3-8b-8192",
        },
        "llama-3.1-70b-versatile": {
          llm: "GROQ",
          model_name: "llama-3.1-70b-versatile",
        },
        "llama-3.1-8b-instant": {
          llm: "GROQ",
          model_name: "llama-3.1-8b-instant",
        },
        "gemma2-9b-it": {
          llm: "GROQ",
          model_name: "gemma2-9b-it",
        },
        "gemma-7b-it": {
          llm: "GROQ",
          model_name: "gemma-7b-it",
        },
        "gpt-4o-mini": { llm: "OPENAI", model_name: "gpt-4o-mini" },
        "gpt-4o": { llm: "OPENAI", model_name: "gpt-4o" },
        "gpt-4-turbo": { llm: "OPENAI", model_name: "gpt-4-turbo" },
        "gpt-3.5-turbo": { llm: "OPENAI", model_name: "gpt-3.5-turbo" },
      },
      backend: inject("backendService"),

      messages: [],
      message_procession: false,
      scrollsize: 0,
      drawer: false,
    };
  },
};
</script>

<style scoped>
.diagram {
  width: 80%;
}
.home-container {
  height: 100%;
  width: 100vw;
  background-color: #f3f4f6; /* Light Gray Background */
  font-family: serif;
}

.chat-text {
  padding: 5px 5px 0px 5px;
}
.chat-bubble-ai {
  padding-left: 10px;
  max-width: 90%;
}
.welcome-msg {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-content: center;
  gap: 10px;

  height: 70vh;
}
.page-content {
  height: 100dvh;
  width: 100%;
  display: flex;
  justify-content: center;
}
.user-text {
  padding-right: 10px;
}
.chat-area {
  flex-grow: 1;
  margin: 10px;
}
.chat-area .fit {
  width: 100%;
}

.chat-window {
  max-width: 1200px;
  font-size: 1.1rem;
  display: flex;
  flex-direction: column;
  width: 100vw;
}
.chat-text-box {
  align-self: center;
  max-width: 900px;
  width: 100%;
  padding-left: 20px;
  padding-right: 20px;
  padding-bottom: 20px;
}
.chat-input {
  font-size: 1.2rem;
  max-height: 300px;
  width: 100%;
}

.home-container {
  height: 100%;
  width: 100vw;
}

.chat-history {
  background-color: rgb(38, 56, 50);
}

.chat-container {
  background-color: aquamarine;
}

img {
  background: antiquewhite !important;
  width: 20px !important;
  height: 20px !important;
  min-width: 20px !important;
}

.welcome-container {
  display: flex;
  flex-direction: column; /* Keep this as column to stack heading and message boxes */
  align-items: center;
  text-align: center;
  width: 100%;
  margin-bottom: 20px;
}

.welcome-heading {
  font-size: 2.8rem; /* Larger, bolder */
  font-weight: 800;
  text-align: left;
  align-items: left;

  background: linear-gradient(90deg, #ff6b6b, #ff9a8b, #fdcb58, #4ade80);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: textGradientAnimation 3s infinite linear alternate;
}

.subtitle {
  font-size: 1.6rem;
  font-weight: 600;
  color: #b0bec5;
  margin-left: 50px;
}

.highlight {
  background: linear-gradient(90deg, #ff6a00, #ffde59);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.flavour-text {
  background: linear-gradient(90deg, #00d1b2, #1e90ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-style: italic;
}

@keyframes textGradientAnimation {
  0% {
    background-position: 0%;
  }
  100% {
    background-position: 100%;
  }
}

.welcome-msg {
  display: flex;
  flex-direction: row; /* Ensures horizontal layout */
  justify-content: center; /* Centers the boxes */
  align-items: center; /* Aligns items vertically */
  gap: 20px; /* Adds spacing between message boxes */
  flex-wrap: wrap; /* Allows wrapping if screen size is small */
  width: 100%;
  padding-left: 20px; /* Add left padding */
  padding-right: 20px; /* Add right padding */
  position: relative;
  margin-top: -30px; /* Moves the section slightly upwards */
}

.headtext {
  text-align: left;
  position: relative;
  align-items: left;
}

.message-box {
  cursor: pointer;
  padding: 10px;
  border-radius: 8px;
  background-color: #f3f4f6;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: 0.3s;
}

.message-box:hover {
  background-color: #e2e3e5;
}

.chat-text-box {
  border-color: #1e1e2e;
}

/* Send button container */
.send-button {
  color: white;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  box-shadow: 0 4px 15px rgba(0, 114, 255, 0.5);
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0%;
  margin: 0px;
}

/* Hover effect: Neon glow & scaling */
.send-button:hover {
  transform: scale(1.1); /* Slightly enlarges */
  box-shadow: 0 6px 20px rgba(0, 114, 255, 0.7); /* Stronger glow */
}

/* Click (Active) effect */
.send-button:active {
  transform: scale(0.9);
  box-shadow: 0 2px 10px rgba(0, 114, 255, 0.4);
}

/* Icon inside the button */
.send-button .q-icon {
  font-size: 24px; /* Bigger icon */
  transition: transform 0.2s ease-in-out;
}

/* Rotate icon slightly on hover */
.send-button:hover .q-icon {
  transform: rotate(20deg);
}

.chat-input {
  display: flex;
  align-items: center;
  padding: 0px; /* Remove internal padding */
  margin: 0px; /* Remove margins */
}

.q-input__control {
  display: flex !important;
  align-items: center !important;
  padding: 0px !important;
  margin: 0px !important;
}

.q-field__control {
  height: 50px; /* Match button height */
  display: flex;
  align-items: center;
}

.q-field__append {
  padding: 0 !important;
  margin: 0 !important;
}

.chat-message-container {
  margin: 15px 20px; /* Add external margins */
  padding: 10px 15px; /* Add padding inside the chat bubble */
  border-radius: 10px; /* Optional: rounded corners */
}
</style>
