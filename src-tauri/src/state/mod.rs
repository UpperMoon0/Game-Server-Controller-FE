use std::sync::Mutex;
use reqwest::Client;

/// Application state shared across all commands
pub struct AppState {
    /// The current API base URL
    pub api_url: Mutex<String>,
    /// HTTP client for making API requests
    pub client: Client,
}

impl AppState {
    /// Create a new AppState with default settings
    pub fn new() -> Result<Self, String> {
        let client = Client::builder()
            .timeout(std::time::Duration::from_secs(30))
            .build()
            .map_err(|e| format!("Failed to create HTTP client: {}", e))?;

        Ok(Self {
            api_url: Mutex::new("http://localhost:8080".to_string()),
            client,
        })
    }

    /// Get the current API URL
    pub fn get_api_url(&self) -> Result<String, String> {
        let url = self.api_url.lock()
            .map_err(|e| format!("Failed to lock api_url: {}", e))?;
        Ok(url.clone())
    }

    /// Set the API URL
    pub fn set_api_url(&self, new_url: String) -> Result<(), String> {
        let mut url = self.api_url.lock()
            .map_err(|e| format!("Failed to lock api_url: {}", e))?;
        *url = new_url;
        Ok(())
    }
}

impl Default for AppState {
    fn default() -> Self {
        Self::new().expect("Failed to create default AppState")
    }
}