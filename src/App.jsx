// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";

import "./App.css";

const App = () => {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState("");
  const [counter, setCounter] = useState(0);

  // Fetch items on initial load
  useEffect(() => {
    const loadItems = async () => {
      const response = await invoke("get_items");
      setItems(response);
    };

    const loadCounter = async () => {
      const currentCounter = await invoke("get_counter");
      setCounter(currentCounter);
    };

    loadItems();
    loadCounter();
  }, []);

  // Handle creating a new item
  const handleCreate = async () => {
    if (!newItem) return;
    console.log(newItem);
    const response = await invoke("create_item", { name: newItem });
    setItems((prevItems) => [...prevItems, response]);
    setNewItem("");
  };

  // Handle deleting an item
  const handleDelete = async (id) => {
    await invoke("delete_item", { id });
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  // Handle updating an item
  const handleUpdate = async (id, name) => {
    const updatedName = prompt("Update the item", name);
    if (updatedName) {
      const updatedItem = await invoke("update_item", {
        id,
        name: updatedName,
      });
      setItems((prevItems) =>
        prevItems.map((item) => (item.id === id ? updatedItem : item))
      );
    }
  };

  // Counter functions
  const incrementCounter = async () => {
    await invoke("increment");
    const currentCounter = await invoke("get_counter");
    setCounter(currentCounter);
  };

  const decrementCounter = async () => {
    await invoke("decrement");
    const currentCounter = await invoke("get_counter");
    setCounter(currentCounter);
  };

  const resetCounter = async () => {
    await invoke("reset");
    const currentCounter = await invoke("get_counter");
    setCounter(currentCounter);
  };

  return (
    <div>
      <h1>React + Tauri CRUD App with MongoDB</h1>

      {/* Counter Section */}
      <div>
        <h2>Counter: {counter}</h2>
        <button
          onClick={incrementCounter}
          style={{ padding: "10px 20px", margin: "5px" }}
        >
          Increment
        </button>
        <button
          onClick={decrementCounter}
          style={{ padding: "10px 20px", margin: "5px" }}
        >
          Decrement
        </button>
        <button
          onClick={resetCounter}
          style={{ padding: "10px 20px", margin: "5px" }}
        >
          Reset
        </button>
      </div>

      {/* CRUD Section */}
      <div>
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          style={{ padding: "10px 20px", margin: "5px" }}
          placeholder="Enter Text"
        />
        <button
          onClick={handleCreate}
          style={{ padding: "10px 20px", margin: "5px" }}
        >
          Submit
        </button>

        <ul style={{ listStyleType: "none", paddingLeft: 0 }}>
          {items.map((item) => (
            <li key={item.id}>
              {item.name}
              <button
                onClick={() => handleUpdate(item.id, item.name)}
                style={{ padding: "5px 10px", margin: "5px" }}
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                style={{ padding: "5px 10px", margin: "5px" }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default App;
