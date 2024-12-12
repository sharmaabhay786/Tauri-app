use std::sync::Mutex;

#[derive(Default)]
struct Counter {
    count: i32,
}

#[tauri::command]
fn get_counter(counter: tauri::State<Mutex<Counter>>) -> i32 {
    let counter = counter.lock().unwrap();
    counter.count
}

#[tauri::command]
fn increment(counter: tauri::State<Mutex<Counter>>) {
    let mut counter = counter.lock().unwrap();
    counter.count += 1;
}

#[tauri::command]
fn decrement(counter: tauri::State<Mutex<Counter>>) {
    let mut counter = counter.lock().unwrap();
    counter.count -= 1;
}

#[tauri::command]
fn reset(counter: tauri::State<Mutex<Counter>>) {
    let mut counter = counter.lock().unwrap();
    counter.count = 0;
}

fn main() {
    // Start the Tauri app without system tray functionality
    tauri::Builder::default()
        .manage(Mutex::new(Counter::default())) // Manage the counter state
        .invoke_handler(tauri::generate_handler![get_counter, increment, decrement, reset])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
