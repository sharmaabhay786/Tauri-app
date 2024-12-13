use mongodb::{Client, options::ClientOptions, bson::doc};
use tauri::{State};
use serde::{Serialize, Deserialize};
use std::sync::Arc;
use tokio::sync::Mutex as TokioMutex;
use uuid::Uuid;
use futures_util::stream::TryStreamExt; // Required for try_next() with mongodb::Cursor


#[derive(Serialize, Deserialize, Clone, Debug)]
struct Item {
    id: String,
    name: String,
}

struct AppState {
    client: Client,
}

impl AppState {
    // Initialize the AppState and MongoDB client
    async fn new() -> Self {
        let client_uri = "mongodb://localhost:27017";
        let client_options = ClientOptions::parse(client_uri)
            .await
            .expect("Failed to parse MongoDB URI");
        let client = Client::with_options(client_options)
            .expect("Failed to initialize MongoDB client");
        AppState { client }
    }
}

// Define the Tauri command to fetch items from MongoDB
#[tauri::command]
async fn get_items(state: State<'_, Arc<TokioMutex<AppState>>>) -> Result<Vec<Item>, String> {
    println!("Fetching items...");
    let app_state = state.lock().await;
    let db = app_state.client.database("crudDb");
    let collection = db.collection::<Item>("items");

    let mut cursor = collection.find(None, None).await.map_err(|e| e.to_string())?;

    let mut items = Vec::new();
    while let Some(doc) = cursor.try_next().await.map_err(|e| e.to_string())? {
        items.push(doc);
    }

    Ok(items)
}

// Define the Tauri command to create a new item in MongoDB
#[tauri::command]
async fn create_item(name: String, state: State<'_, Arc<TokioMutex<AppState>>>) -> Result<Item, String> {
    println!("Attempting to create item with name: {}", name); // Debug log
    let app_state = state.lock().await;
    let db = app_state.client.database("crudDb");
    let collection = db.collection::<Item>("items");

    let new_item = Item {
        id: Uuid::new_v4().to_string(),
        name,
    };

    println!("Inserting item into MongoDB..."); // Debug log
    collection
        .insert_one(new_item.clone(), None)
        .await
        .map_err(|e| {
            println!("Error inserting item: {}", e); // Debug log
            e.to_string()
        })?;

    println!("Item created successfully: {:?}", new_item); // Debug log
    Ok(new_item)
}

// Define other CRUD operations for delete, update, etc.
#[tauri::command]
async fn delete_item(id: String, state: State<'_, Arc<TokioMutex<AppState>>>) -> Result<(), String> {
    let app_state = state.lock().await;
    let db = app_state.client.database("crudDb");
    let collection = db.collection::<Item>("items");

    collection
        .delete_one(doc! { "id": id }, None)
        .await
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
async fn update_item(id: String, name: String, state: State<'_, Arc<TokioMutex<AppState>>>) -> Result<Item, String> {
    let app_state = state.lock().await;
    let db = app_state.client.database("crudDb");
    let collection = db.collection::<Item>("items");

    let updated_item = Item { id: id.clone(), name: name.clone() };

    collection
        .update_one(doc! { "id": id }, doc! { "$set": { "name": name.clone() } }, None)
        .await
        .map_err(|e| e.to_string())?;

    Ok(updated_item)
}

// Counter struct and related commands
#[derive(Default)]
struct Counter {
    count: i32,
}

#[tauri::command]
async fn get_counter(counter: tauri::State<'_, TokioMutex<Counter>>) -> Result<i32, String> {
    let counter = counter.lock().await;
    Ok(counter.count)
}

#[tauri::command]
async fn increment(counter: tauri::State<'_, TokioMutex<Counter>>) -> Result<(), String> {
    let mut counter = counter.lock().await;
    counter.count += 1;
    Ok(())
}

#[tauri::command]
async fn decrement(counter: tauri::State<'_, TokioMutex<Counter>>) -> Result<(), String> {
    let mut counter = counter.lock().await;
    counter.count -= 1;
    Ok(())
}

#[tauri::command]
async fn reset(counter: tauri::State<'_, TokioMutex<Counter>>) -> Result<(), String> {
    let mut counter = counter.lock().await;
    counter.count = 0;
    Ok(())
}

// Main function that sets up the Tauri application
#[tokio::main]
async fn main() {
    // Properly initialize and manage AppState and Counter
    let app_state = AppState::new().await;  // Make sure the state is async initialized
    let counter = Counter::default();

    tauri::Builder::default()
        .manage(Arc::new(TokioMutex::new(app_state))) // Manage AppState correctly
        .manage(Arc::new(TokioMutex::new(counter)))   // Manage Counter correctly
        .invoke_handler(tauri::generate_handler![
            get_items,
            create_item,
            delete_item,
            update_item,
            get_counter,
            increment,
            decrement,
            reset
        ])  // Expose all the commands
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
