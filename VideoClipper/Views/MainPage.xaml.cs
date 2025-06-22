using FFMpegCore;
using System.Diagnostics;
namespace VideoClipper;

public partial class MainPage : ContentPage
{
    private FileResult videoFile;
    private string startTime;
    private string endTime;
    private string outputFileName;
    private bool doMuteMic = false;
    private bool doOverwrite = true;

    public MainPage()
	{
		InitializeComponent();
	}

    private async Task<FileResult> PickAndShow()
    {
        try
        {
            PickOptions pickOptions = new()
            {
                PickerTitle = "Please select a video to cut",
                FileTypes = FilePickerFileType.Videos,
            };
            var result = await FilePicker.Default.PickAsync(pickOptions);
            if (result != null)
            {
                FileNameLabel.Text = result.FileName;
            }
            return result;
        }
        catch (Exception ex)
        {
            // The user canceled or something went wrong
        }
        return null;
    }

    private async void PickFile(object? sender, EventArgs e)
    {
        videoFile = await PickAndShow();
    }

    //private async void ProcessVideo(object? sender, EventArgs e)
    //{
    //    Action<TimeSpan> progressHandler = new Action<TimeSpan>(p =>
    //    {
    //        MainThread.BeginInvokeOnMainThread(() =>
    //        {
    //            Progress.Text = "Progress on encode: " + p.ToString("mm':'ss':'fff");
    //        });
    //    });

    //    if (videoFile != null)
    //    {
    //        var mediaInfo = FFProbe.Analyse(videoFile.FullPath);
    //        int audioStreamCount = mediaInfo.AudioStreams.Count;
    //        string pathMinusFileName = videoFile.FullPath.Replace(videoFile.FileName, "");
    //        string outputPath;
    //        if (outputFileName != null)
    //        {
    //            outputPath = pathMinusFileName + outputFileName + ".mp4";
    //        }
    //        else
    //        {
    //            outputPath = pathMinusFileName + "output.mp4";
    //        }
    //        await FFMpegArguments
    //            .FromFileInput(videoFile.FullPath)
    //            .OutputToFile(outputPath, doOverwrite, options => options
    //                .UsingMultithreading(true)
    //                .WithFastStart())
    //            .NotifyOnProgress(progressHandler)
    //            .ProcessAsynchronously();
    //    }
    //}

    private void OnStartEntryTextChanged(object? sender, EventArgs e)
    {
        startTime = StartEntryInput.Text;
    }

    private void OnEndEntryTextChanged(object? sender, EventArgs e)
    {
        endTime = EndEntryInput.Text;
    }

    private void OnOutputNameChanged(object? sender, EventArgs e)
    {
        outputFileName = OutputFileNameInput.Text;
    }

    private void OnMuteMicCheckBoxChanged(object sender, CheckedChangedEventArgs e)
    {
        doMuteMic = e.Value;
    }

    private void OnCheckBoxChanged(object sender, CheckedChangedEventArgs e)
    {
        doOverwrite = e.Value;
    }

    private void CallTerminal(object? sender, EventArgs e)
    {
        ProgressLabel.Text = "";
        if (videoFile != null)
        {
            // This doesn't update. Is the main thread frozen?
            ProgressLabel.Text = "Processing...";
            var mediaInfo = FFProbe.Analyse(videoFile.FullPath);
            int audioStreamCount = mediaInfo.AudioStreams.Count;
            if (doMuteMic)
            {
                audioStreamCount--;
            }

            if (startTime == null || startTime.Length == 0)
            {
                // Start at the beginning of the clip
                startTime = "0";
            }

            if (endTime == null || endTime.Length == 0)
            {
                // Use the clip's duration for the endTime
                endTime = mediaInfo.Duration.ToString();
            }

            string overwriteOption = doOverwrite ? "-y" : "";

            string pathMinusFileName = videoFile.FullPath.Replace(videoFile.FileName, "");
            string outputPath = pathMinusFileName + (outputFileName != null ? outputFileName : "output") + ".mp4";

            Process cmd = new Process();
            cmd.StartInfo.FileName = "cmd.exe";
            cmd.StartInfo.RedirectStandardInput = true;
            cmd.StartInfo.RedirectStandardOutput = true;
            cmd.StartInfo.CreateNoWindow = true; // Set to false if you want the terminal to open
            cmd.StartInfo.UseShellExecute = false;
            cmd.Start();

            cmd.StandardInput.WriteLine($"ffmpeg -ss {startTime} -to {endTime} -i \"{videoFile.FullPath}\" -c:v copy -c:a aac -b:a 160k -ac 2 -filter_complex amerge=inputs={audioStreamCount} {overwriteOption} \"{outputPath}\"");
            cmd.StandardInput.Flush();
            cmd.StandardInput.Close();
            cmd.WaitForExit();
            Debug.WriteLine(cmd.StandardOutput.ReadToEnd());
            UpdateCompletionLabel();
        }
    }

    private async void UpdateCompletionLabel()
    {
        ProgressLabel.Text = "Processing complete!";
        await Task.Delay(2000);
        ProgressLabel.Text = "";
    }
}