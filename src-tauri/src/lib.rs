use futures_util::StreamExt;
use reqwest::header;
use std::fs::OpenOptions;
use std::io::{Seek, SeekFrom, Write};
use tauri::{AppHandle, Emitter};

// 创建稀疏文件（不会立即占用全部磁盘空间）
#[tauri::command]
fn create_sparse_file(path: &str, total_size: u64) {
    let file = OpenOptions::new()
        .create(true)
        .write(true)
        .open(path)
        .expect("Failed to create file");

    file.set_len(total_size).expect("Failed to create file");
}

// 按偏移写入分片
#[tauri::command]
fn write_at_offset(file_path: &str, offset: u64, data: Vec<u8>) {
    let mut file = OpenOptions::new()
        .write(true)
        .open(file_path)
        .expect("Failed to open file");
    file.seek(SeekFrom::Start(offset)).expect("Failed to seek");
    file.write_all(&data).expect("Failed to write");
}

#[tauri::command]
async fn download(
    app: AppHandle,
    url: &str,
    start: u64,
    end: u64,
    save_path: &str,
) -> Result<(), String> {
    let client = reqwest::Client::new();
    let response = client
        .get(url)
        .header(header::RANGE, format!("bytes={}-{}", start, end))
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let total_size = response.content_length().ok_or("无法获取文件大小")? as u64;

    if end > total_size {
        return Err("结束位置超出文件大小".into());
    }

    let mut file = OpenOptions::new()
        .write(true)
        .create(true)
        .open(save_path)
        .map_err(|e| e.to_string())?;

    let mut downloaded = 0;

    // 使用响应的字节流进行分段下载
    let mut stream = response.bytes_stream(); // 先将流提取出来

    while let Some(chunk) = stream.next().await {
        let chunk = chunk.map_err(|e| e.to_string())?;
        downloaded += chunk.len() as u64;

        file.write_all(&chunk).map_err(|e| e.to_string())?;

        let progress = (downloaded as f64 / total_size as f64 * 100.0) as u32;
        app.emit_to("download", "download-result", progress)
            .map_err(|e| e.to_string())?;
    }

    Ok(())
}

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_upload::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            create_sparse_file,
            write_at_offset,
            download
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
