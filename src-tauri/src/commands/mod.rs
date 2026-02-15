use crate::api::ApiClient;
use crate::settings::{AppSettings, load_settings, save_settings, reset_settings};
use crate::state::AppState;
use serde_json::Value;
use tauri::Manager;

// ==================== System Commands ====================

/// Close the splashscreen window and show the main window
#[tauri::command]
pub async fn close_splashscreen(window: tauri::Window) {
    if let Some(splashscreen) = window.get_window("splashscreen") {
        splashscreen.close().unwrap();
    }
    if let Some(main) = window.get_window("main") {
        main.show().unwrap();
    }
}

/// Get the current platform (OS)
#[tauri::command]
pub fn get_platform() -> String {
    std::env::consts::OS.to_string()
}

/// Get the application version
#[tauri::command]
pub fn get_version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

// ==================== Settings Commands ====================

/// Get the current settings
#[tauri::command]
pub fn get_settings(
    app_handle: tauri::AppHandle,
    state: tauri::State<'_, AppState>,
) -> Result<AppSettings, String> {
    let settings = load_settings(&app_handle)?;
    
    // Update the API URL in state
    state.set_api_url(settings.api_url.clone())?;
    
    Ok(settings)
}

/// Save new settings
#[tauri::command]
pub fn save_settings_cmd(
    app_handle: tauri::AppHandle,
    state: tauri::State<'_, AppState>,
    settings: AppSettings,
) -> Result<(), String> {
    // Update the API URL in state
    state.set_api_url(settings.api_url.clone())?;
    
    save_settings(&app_handle, &settings)
}

/// Reset settings to defaults
#[tauri::command]
pub fn reset_settings_cmd(
    app_handle: tauri::AppHandle,
    state: tauri::State<'_, AppState>,
) -> Result<AppSettings, String> {
    let default_settings = reset_settings(&app_handle)?;
    
    // Update the API URL in state
    state.set_api_url(default_settings.api_url.clone())?;
    
    Ok(default_settings)
}

// ==================== API Proxy Commands ====================

/// Make a GET request to the backend API
#[tauri::command]
pub async fn api_get(
    state: tauri::State<'_, AppState>,
    endpoint: String,
) -> Result<Value, String> {
    let client = ApiClient::new(&state);
    client.get(&endpoint).await
}

/// Make a POST request to the backend API
#[tauri::command]
pub async fn api_post(
    state: tauri::State<'_, AppState>,
    endpoint: String,
    body: Value,
) -> Result<Value, String> {
    let client = ApiClient::new(&state);
    client.post(&endpoint, body).await
}

/// Make a PUT request to the backend API
#[tauri::command]
pub async fn api_put(
    state: tauri::State<'_, AppState>,
    endpoint: String,
    body: Value,
) -> Result<Value, String> {
    let client = ApiClient::new(&state);
    client.put(&endpoint, body).await
}

/// Make a DELETE request to the backend API
#[tauri::command]
pub async fn api_delete(
    state: tauri::State<'_, AppState>,
    endpoint: String,
) -> Result<Value, String> {
    let client = ApiClient::new(&state);
    client.delete(&endpoint).await
}

/// Download a file from the backend API (returns binary data as Vec<u8>)
#[tauri::command]
pub async fn api_download(
    state: tauri::State<'_, AppState>,
    endpoint: String,
) -> Result<Vec<u8>, String> {
    let client = ApiClient::new(&state);
    client.download(&endpoint).await
}

/// Upload a file to the backend API
#[tauri::command]
pub async fn api_upload(
    state: tauri::State<'_, AppState>,
    endpoint: String,
    file_path: String,
) -> Result<Value, String> {
    let client = ApiClient::new(&state);
    client.upload(&endpoint, &file_path).await
}