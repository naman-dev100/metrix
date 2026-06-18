// Service Worker custom event listener for handling active workout notification click
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  // Look for an existing open window and focus it, or open a new window
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        // Focus client if it has /workout in its URL
        if (client.url.includes("/workout") && "focus" in client) {
          return client.focus();
        }
      }
      // If no workout window is found, open a new window at /workout
      if (self.clients.openWindow) {
        return self.clients.openWindow("/workout");
      }
    })
  );
});
