use crate::state::AppState;
use serde_json::Value;

/// API client for making HTTP requests through the BFF
pub struct ApiClient<'a> {
    state: &'a AppState,
}

impl<'a> ApiClient<'a> {
    /// Create a new API client
    pub fn new(state: &'a AppState) -> Self {
        Self { state }
    }

    /// Build the full URL for an endpoint
    fn build_url(&self, endpoint: &str) -> Result<String, String> {
        let base_url = self.state.get_api_url()?;
        Ok(format!("{}{}", base_url, endpoint))
    }

    /// Make a GET request
    pub async fn get(&self, endpoint: &str) -> Result<Value, String> {
        let url = self.build_url(endpoint)?;
        
        let response = self.state.client
            .get(&url)
            .send()
            .await
            .map_err(|e| format!("Request failed: {}", e))?;

        self.handle_response(response).await
    }

    /// Make a POST request with JSON body
    pub async fn post(&self, endpoint: &str, body: Value) -> Result<Value, String> {
        let url = self.build_url(endpoint)?;
        
        let response = self.state.client
            .post(&url)
            .json(&body)
            .send()
            .await
            .map_err(|e| format!("Request failed: {}", e))?;

        self.handle_response(response).await
    }

    /// Make a PUT request with JSON body
    pub async fn put(&self, endpoint: &str, body: Value) -> Result<Value, String> {
        let url = self.build_url(endpoint)?;
        
        let response = self.state.client
            .put(&url)
            .json(&body)
            .send()
            .await
            .map_err(|e| format!("Request failed: {}", e))?;

        self.handle_response(response).await
    }

    /// Make a DELETE request
    pub async fn delete(&self, endpoint: &str) -> Result<Value, String> {
        let url = self.build_url(endpoint)?;
        
        let response = self.state.client
            .delete(&url)
            .send()
            .await
            .map_err(|e| format!("Request failed: {}", e))?;

        self.handle_response(response).await
    }

    /// Handle the HTTP response
    async fn handle_response(&self, response: reqwest::Response) -> Result<Value, String> {
        let status = response.status();
        
        if !status.is_success() {
            let error_text = response.text().await
                .unwrap_or_else(|_| "Unknown error".to_string());
            return Err(format!("API error ({}): {}", status, error_text));
        }

        // Handle empty responses
        let text = response.text().await
            .map_err(|e| format!("Failed to read response: {}", e))?;
        
        if text.is_empty() {
            return Ok(serde_json::json!({}));
        }
        
        let json: Value = serde_json::from_str(&text)
            .map_err(|e| format!("Failed to parse response: {}", e))?;

        Ok(json)
    }
}