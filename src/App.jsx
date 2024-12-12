// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";


function App() {
  const [count, setCount] = useState(0);

  // Function to fetch the current counter from the backend
  const getCounter = async () => {
    try {
      const currentCount = await invoke("get_counter");
      setCount(currentCount);
    } catch (e) {
      console.error("Error fetching counter:", e);
    }
  };

  // Fetch the initial counter value when the app loads
  useEffect(() => {
    getCounter();
  }, []);

  // Increment the counter (calls the backend)
  const increment = async () => {
    try {
      await invoke("increment");
      getCounter(); // Fetch updated counter value
    } catch (e) {
      console.error("Error incrementing counter:", e);
    }
  };

  // Decrement the counter (calls the backend)
  const decrement = async () => {
    try {
      await invoke("decrement");
      getCounter(); // Fetch updated counter value
    } catch (e) {
      console.error("Error decrementing counter:", e);
    }
  };

  // Reset the counter (calls the backend)
  const reset = async () => {
    try {
      await invoke("reset");
      getCounter(); // Fetch updated counter value
    } catch (e) {
      console.error("Error resetting counter:", e);
    }
  };

  return (
    <div
      style={{
        display: "flex", // Use Flexbox to align content
        justifyContent: "center", // Center horizontally
        alignItems: "center", // Center vertically
        height: "100vh", // Make the div take full height of the viewport
        width: "100vw", // Make the div take full width of the viewport
      }}
    >
      <div style={{ textAlign: "center",  }}>
        <h1>Counter: {count}</h1>
        <div
          style={{
            marginTop: "20px", // Add some margin to the top of the button container
            padding: "20px", // Add padding to the div
            display: "flex", // Use flex to align the buttons horizontally
            justifyContent: "center", // Center the buttons
            gap: "15px", // Add space between buttons
          }}
        >
          <button onClick={increment}>Increment</button>
          <button onClick={decrement}>Decrement</button>
          <button onClick={reset}>Reset</button>
        </div>
      </div>
    </div>
  );
}

export default App;
