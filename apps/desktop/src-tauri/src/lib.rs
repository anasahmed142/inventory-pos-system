#[tauri::command]
fn print_raw_thermal(bytes: Vec<u8>) -> Result<(), String> {
    println!("Printing raw thermal bytes: {} bytes", bytes.len());
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::default().build())
        .invoke_handler(tauri::generate_handler![print_raw_thermal])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}