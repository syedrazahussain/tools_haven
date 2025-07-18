self.addEventListener("push", function (event) {
  console.log("🔥 Push event received");

  const data = event.data?.json() || {};
  console.log("📦 Push data:", data);

  const options = {
    body: data.body || "No body",
    icon: data.icon || "/default-image.png", 
    tag: "tools-haven-tag", // 🏷️ ensures uniqueness
    renotify: true, // 🛎️ notify even if same tag
    requireInteraction: true, // 📌 forces display
  };

  event.waitUntil(
    self.registration.showNotification(data.title || "No title", options)
  );
});
