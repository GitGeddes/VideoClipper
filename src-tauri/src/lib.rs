use std::io::{self, Write};
use std::process::Command;

use log::{debug, info};

#[tauri::command(rename_all = "snake_case")]
fn get_frame_count(in_file: &str) -> i32 {
    let ffprobe_output = Command::new("ffprobe")
        .args(["-v", "error"])
        .args(["-select_streams", "v:0"])
        .args(["-show_entries", "stream=nb_frames"])
        .args(["-of", "default=nw=1:nk=1"])
        .arg(in_file)
        .output()
        .expect("failed to execute process");

    let frames = String::from_utf8(ffprobe_output.stdout).expect("7200");

    let frame_count = match frames.trim().parse::<i32>() {
        Ok(val) => val,
        Err(e) => {
            debug!("Error parsing frame count: {}", e);
            7200 // Default: 2 minutes * 60 fps
        }
    };
    frame_count
}

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
// ffmpeg -ss 1:19 -to 2:00 -i input.mp4 -c:v copy -c:a aac -b:a 160k -ac 2 -filter_complex amerge=inputs=$(ffprobe -loglevel error -select_streams a -show_entries stream=index -of csv=p=0 input.mp4 | wc -l) output.mp4
#[tauri::command(rename_all = "snake_case")]
fn call_ffmpeg(
    start: &str,
    end: &str,
    in_file: &str,
    in_folder: &str,
    audio_stream_count: i32,
    out_file: &str,
    do_overwrite: &str
) -> String {
    let stream_count = get_stream_count(in_file);
    let streams = if stream_count < audio_stream_count { stream_count } else { audio_stream_count };

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
            &format!("amerge=inputs={}", streams).to_string()
        ])
        .arg(out_file)
        .arg(do_overwrite)
        .output()
        .expect("failed to execute process");

    // let _ = io::stdout().write_all(&output.stdout);
    // let _ = io::stderr().write_all(&output.stderr);
    output.status.to_string()
}

// Get audio track count before attempting and failing
fn get_stream_count(in_file: &str) -> i32 {
    let ffprobe_output = Command::new("ffprobe")
        .args(["-v", "error"])
        .args(["-show_entries", "format=nb_streams"])
        .args(["-of", "default=nw=1:nk=1"])
        .arg(in_file)
        .output()
        .expect("failed to execute process");

    let streams = String::from_utf8(ffprobe_output.stdout)
        .expect("2"); // Default assume there is 1 video stream and 1 audio stream

    let stream_count = match streams.trim().parse::<i32>() {
        Ok(val) => val,
        Err(e) => {
            debug!("Error parsing int from string: {}", e);
            2 // Default assume there is 1 video stream and 1 audio stream
        }
    };
    return stream_count - 1 // Don't count the video stream
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
        .invoke_handler(tauri::generate_handler![call_ffmpeg, get_frame_count])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
