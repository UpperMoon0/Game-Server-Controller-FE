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
        println!("[BFF] GET {}", url);
        
        let response = self.state.client
            .get(&url)
            .send()
            .await
            .map_err(|e| {
                let err_msg = format!("Request failed: {}", e);
                eprintln!("[BFF ERROR] GET {} - {}", url, e);
                err_msg
            })?;

        self.handle_response(response, "GET", &url).await
    }

    /// Make a POST request with JSON body
    pub async fn post(&self, endpoint: &str, body: Value) -> Result<Value, String> {
        let url = self.build_url(endpoint)?;
        println!("[BFF] POST {} body={}", url, body);
        
        let response = self.state.client
            .post(&url)
            .json(&body)
            .send()
            .await
            .map_err(|e| {
                let err_msg = format!("Request failed: {}", e);
                eprintln!("[BFF ERROR] POST {} - {}", url, e);
                err_msg
            })?;

        self.handle_response(response, "POST", &url).await
    }

    /// Make a PUT request with JSON body
    pub async fn put(&self, endpoint: &str, body: Value) -> Result<Value, String> {
        let url = self.build_url(endpoint)?;
        println!("[BFF] PUT {} body={}", url, body);
        
        let response = self.state.client
            .put(&url)
            .json(&body)
            .send()
            .await
            .map_err(|e| {
                let err_msg = format!("Request failed: {}", e);
                eprintln!("[BFF ERROR] PUT {} - {}", url, e);
                err_msg
            })?;

        self.handle_response(response, "PUT", &url).await
    }

    /// Make a DELETE request
    pub async fn delete(&self, endpoint: &str) -> Result<Value, String> {
        let url = self.build_url(endpoint)?;
        println!("[BFF] DELETE {}", url);
        
        let response = self.state.client
            .delete(&url)
            .send()
            .await
            .map_err(|e| {
                let err_msg = format!("Request failed: {}", e);
                eprintln!("[BFF ERROR] DELETE {} - {}", url, e);
                err_msg
            })?;

        self.handle_response(response, "DELETE", &url).await
    }

    /// Download binary data from an endpoint
    pub async fn download(&self, endpoint: &str) -> Result<Vec<u8>, String> {
        let url = self.build_url(endpoint)?;
        println!("[BFF] DOWNLOAD {}", url);
        
        let response = self.state.client
            .get(&url)
            .send()
            .await
            .map_err(|e| {
                let err_msg = format!("Download request failed: {}", e);
                eprintln!("[BFF ERROR] DOWNLOAD {} - {}", url, e);
                err_msg
            })?;

        let status = response.status();
        println!("[BFF] DOWNLOAD {} - Status: {}", url, status);
        
        if !status.is_success() {
            let error_text = response.text().await
                .unwrap_or_else(|_| "Unknown error".to_string());
            let err_msg = format!("API error ({}): {}", status, error_text);
            eprintln!("[BFF ERROR] DOWNLOAD {} - {}", url, err_msg);
            return Err(err_msg);
        }

        let bytes = response.bytes().await
            .map_err(|e| {
                let err_msg = format!("Failed to read response bytes: {}", e);
                eprintln!("[BFF ERROR] DOWNLOAD {} - {}", url, err_msg);
                err_msg
            })?;

        println!("[BFF] DOWNLOAD {} - Received {} bytes", url, bytes.len());
        Ok(bytes.to_vec())
    }

    /// Upload a file to an endpoint
    pub async fn upload(&self, endpoint: &str, file_path: &str) -> Result<Value, String> {
        let url = self.build_url(endpoint)?;
        println!("[BFF] UPLOAD {} file={}", url, file_path);
        
        // Read the file
        let file_content = std::fs::read(file_path)
            .map_err(|e| {
                let err_msg = format!("Failed to read file: {}", e);
                eprintln!("[BFF ERROR] UPLOAD {} - {}", url, err_msg);
                err_msg
            })?;

        let file_name = std::path::Path::new(file_path)
            .file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("file");

        let part = reqwest::multipart::Part::bytes(file_content)
            .file_name(file_name.to_string());

        let form = reqwest::multipart::Form::new()
            .part("file", part);

        let response = self.state.client
            .post(&url)
            .multipart(form)
            .send()
            .await
            .map_err(|e| {
                let err_msg = format!("Upload request failed: {}", e);
                eprintln!("[BFF ERROR] UPLOAD {} - {}", url, e);
                err_msg
            })?;

        self.handle_response(response, "UPLOAD", &url).await
    }

    /// Handle the HTTP response
    async fn handle_response(&self, response: reqwest::Response, method: &str, url: &str) -> Result<Value, String> {
        let status = response.status();
        println!("[BFF] {} {} - Status: {}", method, url, status);
        
        if !status.is_success() {
            let error_text = response.text().await
                .unwrap_or_else(|_| "Unknown error".to_string());
            let err_msg = format!("API error ({}): {}", status, error_text);
            eprintln!("[BFF ERROR] {} {} - {}", method, url, err_msg);
            return Err(err_msg);
        }

        // Handle empty responses
        let text = response.text().await
            .map_err(|e| {
                let err_msg = format!("Failed to read response: {}", e);
                eprintln!("[BFF ERROR] {} {} - {}", method, url, err_msg);
                err_msg
            })?;
        
        if text.is_empty() {
            println!("[BFF] {} {} - Empty response, returning empty object", method, url);
            return Ok(serde_json::json!({}));
        }
        
        let json: Value = serde_json::from_str(&text)
            .map_err(|e| {
                let err_msg = format!("Failed to parse response: {}", e);
                eprintln!("[BFF ERROR] {} {} - Response text: {}", method, url, text);
                err_msg
            })?;

        println!("[BFF] {} {} - Response: {:?}", method, url, json);
        Ok(json)
    }
}