use std::process::Command;

use log::debug;

#[tauri::command(rename_all = "snake_case")]
pub fn get_frame_count(in_file: &str) -> i32 {
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