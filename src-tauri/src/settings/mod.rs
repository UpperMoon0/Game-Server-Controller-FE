use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

/// Application settings stored in a JSON file
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

/// Get the path to the settings file
pub fn get_settings_path(app_handle: &tauri::AppHandle) -> PathBuf {
    let app_data_dir = app_handle.path_resolver().app_data_dir().unwrap();
    fs::create_dir_all(&app_data_dir).ok();
    app_data_dir.join("settings.json")
}

/// Load settings from file, creating default if not exists
pub fn load_settings(app_handle: &tauri::AppHandle) -> Result<AppSettings, String> {
    let settings_path = get_settings_path(app_handle);
    
    if settings_path.exists() {
        let content = fs::read_to_string(&settings_path)
            .map_err(|e| format!("Failed to read settings: {}", e))?;
        let settings: AppSettings = serde_json::from_str(&content)
            .map_err(|e| format!("Failed to parse settings: {}", e))?;
        Ok(settings)
    } else {
        let default_settings = AppSettings::default();
        save_settings(app_handle, &default_settings)?;
        Ok(default_settings)
    }
}

/// Save settings to file
pub fn save_settings(app_handle: &tauri::AppHandle, settings: &AppSettings) -> Result<(), String> {
    let settings_path = get_settings_path(app_handle);
    let content = serde_json::to_string_pretty(settings)
        .map_err(|e| format!("Failed to serialize settings: {}", e))?;
    fs::write(&settings_path, content)
        .map_err(|e| format!("Failed to write settings: {}", e))?;
    Ok(())
}

/// Reset settings to defaults
pub fn reset_settings(app_handle: &tauri::AppHandle) -> Result<AppSettings, String> {
    let default_settings = AppSettings::default();
    save_settings(app_handle, &default_settings)?;
    Ok(default_settings)
}