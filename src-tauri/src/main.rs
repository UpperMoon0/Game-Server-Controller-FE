#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod api;
mod commands;
mod settings;
mod state;

use state::AppState;

fn main() {
    let state = AppState::new()
        .expect("Failed to create application state");

    tauri::Builder::default()
        .manage(state)
        .invoke_handler(tauri::generate_handler![
            // System commands
            commands::close_splashscreen,
            commands::get_platform,
            commands::get_version,
            // Settings commands
            commands::get_settings,
            commands::save_settings_cmd,
            commands::reset_settings_cmd,
            // API proxy commands
            commands::api_get,
            commands::api_post,
            commands::api_put,
            commands::api_delete
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
