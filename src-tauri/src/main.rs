#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::Manager;
use std::sync::Mutex;
use reqwest::Client;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AppSettings {
    pub api_url: String,
    pub refresh_interval: u32,
    pub notifications: bool,
    pub dark_mode: bool,
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            api_url: "http://localhost:8080".to_string(),
            refresh_interval: 30,
            notifications: true,
            dark_mode: true,
        }
    }
}

// State to hold the current API URL
pub struct AppState {
    api_url: Mutex<String>,
    client: Client,
}

fn get_settings_path(app_handle: &tauri::AppHandle) -> PathBuf {
    let app_data_dir = app_handle.path_resolver().app_data_dir().unwrap();
    fs::create_dir_all(&app_data_dir).ok();
    app_data_dir.join("settings.json")
}

#[tauri::command]
async fn close_splashscreen(window: tauri::Window) {
    if let Some(splashscreen) = window.get_window("splashscreen") {
        splashscreen.close().unwrap();
    }
    if let Some(main) = window.get_window("main") {
        main.show().unwrap();
    }
}

#[tauri::command]
fn get_platform() -> String {
    std::env::consts::OS.to_string()
}

#[tauri::command]
fn get_version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

#[tauri::command]
fn get_settings(app_handle: tauri::AppHandle, state: tauri::State<'_, AppState>) -> Result<AppSettings, String> {
    let settings_path = get_settings_path(&app_handle);
    
    let settings = if settings_path.exists() {
        let content = fs::read_to_string(&settings_path)
            .map_err(|e| format!("Failed to read settings: {}", e))?;
        let settings: AppSettings = serde_json::from_str(&content)
            .map_err(|e| format!("Failed to parse settings: {}", e))?;
        settings
    } else {
        let default_settings = AppSettings::default();
        save_settings_internal(&app_handle, &default_settings)?;
        default_settings
    };

    // Update the API URL in state
    let mut api_url = state.api_url.lock().map_err(|e| e.to_string())?;
    *api_url = settings.api_url.clone();

    Ok(settings)
}

#[tauri::command]
fn save_settings(app_handle: tauri::AppHandle, state: tauri::State<'_, AppState>, settings: AppSettings) -> Result<(), String> {
    // Update the API URL in state
    let mut api_url = state.api_url.lock().map_err(|e| e.to_string())?;
    *api_url = settings.api_url.clone();
    drop(api_url); // Release the lock before saving

    save_settings_internal(&app_handle, &settings)
}

fn save_settings_internal(app_handle: &tauri::AppHandle, settings: &AppSettings) -> Result<(), String> {
    let settings_path = get_settings_path(app_handle);
    let content = serde_json::to_string_pretty(settings)
        .map_err(|e| format!("Failed to serialize settings: {}", e))?;
    fs::write(&settings_path, content)
        .map_err(|e| format!("Failed to write settings: {}", e))?;
    Ok(())
}

#[tauri::command]
fn reset_settings(app_handle: tauri::AppHandle, state: tauri::State<'_, AppState>) -> Result<AppSettings, String> {
    let default_settings = AppSettings::default();
    
    // Update the API URL in state
    let mut api_url = state.api_url.lock().map_err(|e| e.to_string())?;
    *api_url = default_settings.api_url.clone();
    drop(api_url); // Release the lock before saving

    save_settings_internal(&app_handle, &default_settings)?;
    Ok(default_settings)
}

// ==================== API Proxy Commands ====================

#[tauri::command]
async fn api_get(state: tauri::State<'_, AppState>, endpoint: String) -> Result<serde_json::Value, String> {
    let api_url = {
        let url = state.api_url.lock().map_err(|e| e.to_string())?;
        url.clone()
    };

    let full_url = format!("{}{}", api_url, endpoint);
    
    let response = state.client
        .get(&full_url)
        .send()
        .await
        .map_err(|e| format!("Request failed: {}", e))?;

    let status = response.status();
    if !status.is_success() {
        let error_text = response.text().await.unwrap_or_else(|_| "Unknown error".to_string());
        return Err(format!("API error ({}): {}", status, error_text));
    }

    let json = response.json::<serde_json::Value>()
        .await
        .map_err(|e| format!("Failed to parse response: {}", e))?;

    Ok(json)
}

#[tauri::command]
async fn api_post(state: tauri::State<'_, AppState>, endpoint: String, body: serde_json::Value) -> Result<serde_json::Value, String> {
    let api_url = {
        let url = state.api_url.lock().map_err(|e| e.to_string())?;
        url.clone()
    };

    let full_url = format!("{}{}", api_url, endpoint);
    
    let response = state.client
        .post(&full_url)
        .json(&body)
        .send()
        .await
        .map_err(|e| format!("Request failed: {}", e))?;

    let status = response.status();
    if !status.is_success() {
        let error_text = response.text().await.unwrap_or_else(|_| "Unknown error".to_string());
        return Err(format!("API error ({}): {}", status, error_text));
    }

    let json = response.json::<serde_json::Value>()
        .await
        .map_err(|e| format!("Failed to parse response: {}", e))?;

    Ok(json)
}

#[tauri::command]
async fn api_put(state: tauri::State<'_, AppState>, endpoint: String, body: serde_json::Value) -> Result<serde_json::Value, String> {
    let api_url = {
        let url = state.api_url.lock().map_err(|e| e.to_string())?;
        url.clone()
    };

    let full_url = format!("{}{}", api_url, endpoint);
    
    let response = state.client
        .put(&full_url)
        .json(&body)
        .send()
        .await
        .map_err(|e| format!("Request failed: {}", e))?;

    let status = response.status();
    if !status.is_success() {
        let error_text = response.text().await.unwrap_or_else(|_| "Unknown error".to_string());
        return Err(format!("API error ({}): {}", status, error_text));
    }

    let json = response.json::<serde_json::Value>()
        .await
        .map_err(|e| format!("Failed to parse response: {}", e))?;

    Ok(json)
}

#[tauri::command]
async fn api_delete(state: tauri::State<'_, AppState>, endpoint: String) -> Result<serde_json::Value, String> {
    let api_url = {
        let url = state.api_url.lock().map_err(|e| e.to_string())?;
        url.clone()
    };

    let full_url = format!("{}{}", api_url, endpoint);
    
    let response = state.client
        .delete(&full_url)
        .send()
        .await
        .map_err(|e| format!("Request failed: {}", e))?;

    let status = response.status();
    if !status.is_success() {
        let error_text = response.text().await.unwrap_or_else(|_| "Unknown error".to_string());
        return Err(format!("API error ({}): {}", status, error_text));
    }

    // Handle empty responses
    let text = response.text().await.map_err(|e| format!("Failed to read response: {}", e))?;
    if text.is_empty() {
        return Ok(serde_json::json!({}));
    }
    
    let json: serde_json::Value = serde_json::from_str(&text)
        .map_err(|e| format!("Failed to parse response: {}", e))?;

    Ok(json)
}

fn main() {
    let client = Client::builder()
        .timeout(std::time::Duration::from_secs(30))
        .build()
        .expect("Failed to create HTTP client");

    let state = AppState {
        api_url: Mutex::new("http://localhost:8080".to_string()),
        client,
    };

    tauri::Builder::default()
        .manage(state)
        .invoke_handler(tauri::generate_handler![
            close_splashscreen,
            get_platform,
            get_version,
            get_settings,
            save_settings,
            reset_settings,
            api_get,
            api_post,
            api_put,
            api_delete
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
