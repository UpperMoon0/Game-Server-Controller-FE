#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::Manager;

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
fn get_settings(app_handle: tauri::AppHandle) -> Result<AppSettings, String> {
    let settings_path = get_settings_path(&app_handle);
    
    if settings_path.exists() {
        let content = fs::read_to_string(&settings_path)
            .map_err(|e| format!("Failed to read settings: {}", e))?;
        let settings: AppSettings = serde_json::from_str(&content)
            .map_err(|e| format!("Failed to parse settings: {}", e))?;
        Ok(settings)
    } else {
        let default_settings = AppSettings::default();
        save_settings_internal(&app_handle, &default_settings)?;
        Ok(default_settings)
    }
}

#[tauri::command]
fn save_settings(app_handle: tauri::AppHandle, settings: AppSettings) -> Result<(), String> {
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
fn reset_settings(app_handle: tauri::AppHandle) -> Result<AppSettings, String> {
    let default_settings = AppSettings::default();
    save_settings_internal(&app_handle, &default_settings)?;
    Ok(default_settings)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            close_splashscreen,
            get_platform,
            get_version,
            get_settings,
            save_settings,
            reset_settings
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}


