use std::io::{self, Write};
use std::process::Command;

use log::info;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
// ffmpeg -ss 1:19 -to 2:00 -i input.mp4 -c:v copy -c:a aac -b:a 160k -ac 2 -filter_complex amerge=inputs=$(ffprobe -loglevel error -select_streams a -show_entries stream=index -of csv=p=0 input.mp4 | wc -l) output.mp4
#[tauri::command(rename_all = "snake_case")]
fn callffmpeg(
    start: &str,
    end: &str,
    in_file: &str,
    in_folder: &str,
    audio_stream_count: i32,
    out_file: &str,
    do_overwrite: &str
) -> String {
    let message = format!("status greet {}", in_folder);
    info!("{}", message.to_string());
    info!("amerge=inputs={}", audio_stream_count.to_string());

    // let ffprobe_output = Command::new("ffprobe")
    //     .arg()

    // Consider: Change to bundled ffmpeg.wasm version and convert to TypeScript
    // "@ffmpeg/ffmpeg": "^0.12.15",
    // "@ffmpeg/util": "^0.12.2",
    let output = Command::new("ffmpeg")
        .current_dir(in_folder)
        .args(["-ss", start])
        .args(["-to", end])
        .args(["-i", in_file])
        .args([
            "-c:v",
            "copy",
            "-c:a",
            "aac",
            "-b:a",
            "160k",
            "-ac",
            "2",
            "-filter_complex",
            &format!("amerge=inputs={}", audio_stream_count).to_string()
        ])
        .arg(out_file)
        .arg(do_overwrite)
        .output()
        .expect("failed to execute process");

    info!("test");

    // let output = Command::new("dir")
    //     .current_dir(in_folder)
    //     .output()
    //     .expect("failed to execute process");

    info!("status: {}", output.status);
    let _ = io::stdout().write_all(&output.stdout);
    let _ = io::stderr().write_all(&output.stderr);
    output.status.to_string()
    // format!("poop {}", in_file)
    // format!("Hello, {}! You've been greeted from Rust! {}", name, in_file)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_log::Builder::new()
            .targets([
                tauri_plugin_log::Target::new(tauri_plugin_log::TargetKind::Stdout),
                tauri_plugin_log::Target::new(tauri_plugin_log::TargetKind::Webview)
            ]).build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![callffmpeg])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
