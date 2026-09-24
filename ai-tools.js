// SARVESH AI - Built-in Tool Access Layer
// This file manages capabilities that your website can request.
// IMPORTANT: Browser/Android permissions still have to be granted by the user.

window.SARVESH_TOOLS = {

  // =========================
  // INTERNET / WEB
  // =========================
  async webSearch(query) {
    if (!query) throw new Error("Search query is required.");

    // Connect this to your Cloudflare Worker web-search endpoint.
    const response = await fetch("/api/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ query })
    });

    if (!response.ok) {
      throw new Error("Web search failed.");
    }

    return await response.json();
  },


  // =========================
  // LOCATION
  // =========================
  async getLocation() {
    if (!navigator.geolocation) {
      throw new Error("Location is not supported on this device.");
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        position => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        error => {
          reject(new Error("Location permission was denied or unavailable."));
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    });
  },


  // =========================
  // CAMERA
  // =========================
  async openCamera() {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error("Camera is not supported.");
    }

    return await navigator.mediaDevices.getUserMedia({
      video: true
    });
  },


  // =========================
  // MICROPHONE
  // =========================
  async openMicrophone() {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error("Microphone is not supported.");
    }

    return await navigator.mediaDevices.getUserMedia({
      audio: true
    });
  },


  // =========================
  // VOICE OUTPUT
  // =========================
  speak(text) {
    if (!("speechSynthesis" in window)) {
      throw new Error("Voice output is not supported.");
    }

    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-IN";
    speech.rate = 1;
    speech.pitch = 1;

    window.speechSynthesis.speak(speech);
  },


  // =========================
  // FILE PICKER
  // =========================
  selectFile() {
    return new Promise(resolve => {

      const input = document.createElement("input");

      input.type = "file";
      input.accept = "*/*";

      input.onchange = () => {
        resolve(input.files?.[0] || null);
      };

      input.click();
    });
  },


  // =========================
  // IMAGE PICKER
  // =========================
  selectImage() {
    return new Promise(resolve => {

      const input = document.createElement("input");

      input.type = "file";
      input.accept = "image/*";

      input.onchange = () => {
        resolve(input.files?.[0] || null);
      };

      input.click();
    });
  },


  // =========================
  // CALCULATOR
  // =========================
  calculate(expression) {

    if (!expression) {
      throw new Error("Expression is required.");
    }

    // Only allow mathematical characters.
    if (!/^[0-9+\-*/().%\s]+$/.test(expression)) {
      throw new Error("Invalid mathematical expression.");
    }

    try {
      return Function(`"use strict"; return (${expression})`)();
    } catch {
      throw new Error("Could not calculate expression.");
    }
  },


  // =========================
  // NOTIFICATIONS
  // =========================
  async notify(title, message) {

    if (!("Notification" in window)) {
      throw new Error("Notifications are not supported.");
    }

    if (Notification.permission !== "granted") {
      const permission = await Notification.requestPermission();

      if (permission !== "granted") {
        throw new Error("Notification permission was denied.");
      }
    }

    return new Notification(title, {
      body: message
    });
  },


  // =========================
  // HELPLINE LOOKUP
  // =========================
  async getHelpline(country, category) {

    const response = await fetch("/api/helpline", {
      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        country,
        category
      })
    });

    if (!response.ok) {
      throw new Error("Unable to retrieve a verified helpline.");
    }

    return await response.json();
  },


  // =========================
  // AVAILABLE CAPABILITIES
  // =========================
  capabilities() {

    return {
      webSearch: true,

      location:
        "geolocation" in navigator,

      camera:
        !!navigator.mediaDevices?.getUserMedia,

      microphone:
        !!navigator.mediaDevices?.getUserMedia,

      voiceOutput:
        "speechSynthesis" in window,

      filePicker:
        true,

      imagePicker:
        true,

      calculator:
        true,

      notifications:
        "Notification" in window,

      helplineLookup:
        true
    };
  }
};


// Make it easy for the AI interface to access the tools.
window.SARVESH = window.SARVESH || {};

window.SARVESH.tools = window.SARVESH_TOOLS;

console.log("SARVESH AI tools loaded.");
console.log("Available capabilities:", window.SARVESH_TOOLS.capabilities());
