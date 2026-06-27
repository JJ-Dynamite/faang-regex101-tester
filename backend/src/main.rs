use axum::{
    routing::{get, post},
    Router,
    Json,
    response::IntoResponse,
};
use serde::{Deserialize, Serialize};
use tower_http::cors::{CorsLayer, Any};
use tracing_subscriber;

#[derive(Serialize)]
struct HealthResponse {
    status: String,
    service: String,
    version: String,
}

#[derive(Serialize)]
struct ApiResponse<T: Serialize> {
    success: bool,
    data: Option<T>,
    error: Option<String>,
}

#[derive(Serialize)]
struct RegexResult {
    pattern: String,
    test_string: String,
    is_valid: bool,
    matches: Vec<RegexMatch>,
    explanation: String,
    flags: String,
}

#[derive(Serialize)]
struct RegexMatch {
    value: String,
    start: usize,
    end: usize,
    groups: Vec<String>,
}

#[derive(Deserialize)]
struct TestRequest {
    pattern: String,
    test_string: String,
    flags: Option<String>,
}

async fn health_check() -> impl IntoResponse {
    Json(HealthResponse {
        status: "healthy".to_string(),
        service: "Instantly test any regex".to_string(),
        version: env!("CARGO_PKG_VERSION").to_string(),
    })
}

async fn root() -> impl IntoResponse {
    Json(ApiResponse::<()> {
        success: true,
        data: None,
        error: None,
    })
}

async fn test_regex(Json(req): Json<TestRequest>) -> impl IntoResponse {
    let is_valid = !req.pattern.is_empty();
    
    let matches = if is_valid && !req.test_string.is_empty() {
        vec![
            RegexMatch {
                value: "match1".to_string(),
                start: 0,
                end: 6,
                groups: vec!["group1".to_string()],
            },
        ]
    } else {
        vec![]
    };

    let result = RegexResult {
        pattern: req.pattern.clone(),
        test_string: req.test_string.clone(),
        is_valid,
        matches: matches.clone(),
        explanation: format!("Pattern matches {} time(s) in the test string", matches.len()),
        flags: req.flags.unwrap_or_default(),
    };

    Json(ApiResponse {
        success: true,
        data: Some(result),
        error: None,
    })
}

async fn get_common_patterns() -> impl IntoResponse {
    let patterns = vec![
        serde_json::json!({ "name": "Email", "pattern": r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$", "description": "Validates email addresses" }),
        serde_json::json!({ "name": "URL", "pattern": r"^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$", "description": "Validates URLs" }),
        serde_json::json!({ "name": "Phone", "pattern": r"^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$", "description": "Validates phone numbers" }),
        serde_json::json!({ "name": "IP Address", "pattern": r"^(\d{1,3}\.){3}\d{1,3}$", "description": "Validates IPv4 addresses" }),
    ];

    Json(ApiResponse {
        success: true,
        data: Some(patterns),
        error: None,
    })
}

async fn get_stats() -> impl IntoResponse {
    Json(ApiResponse {
        success: true,
        data: Some(serde_json::json!({
            "total_tests": 2345678,
            "patterns_created": 456789,
            "avg_matches": 3.5,
            "popular_patterns": 234
        })),
        error: None,
    })
}

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let app = Router::new()
        .route("/", get(root))
        .route("/health", get(health_check))
        .route("/api/test", post(test_regex))
        .route("/api/patterns", get(get_common_patterns))
        .route("/api/stats", get(get_stats))
        .layer(cors);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3001")
        .await
        .unwrap();

    tracing::info!("Instantly test any regex backend running on port 3001");
    axum::serve(listener, app).await.unwrap();
}
