using FFMpegCore;
using System.Diagnostics;
namespace VideoClipper;

public partial class NewPage1 : ContentPage
{
    private FileResult videoFile;
    private string startTime;
    private string endTime;
    private string outputFileName;
    private bool doMuteMic = false;
    private bool doOverwrite = true;

    public NewPage1()
	{
		InitializeComponent();
	}

    private async Task<FileResult> PickAndShow()
    {
        try
        {
            PickOptions pickOptions = new()
            {
                PickerTitle = "Please select a video to clip",
                FileTypes = FilePickerFileType.Videos,
            };
            var result = await FilePicker.Default.PickAsync(pickOptions);
            if (result != null)
            {
                if (result.FileName.EndsWith("mp4", StringComparison.OrdinalIgnoreCase))
                {
                    Debug.WriteLine(result.FileName);
                }
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
    //        Debug.WriteLine($"Progress on encode: {p}");
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
        //int start;
        //bool success = int.TryParse(StartEntryInput.Text, out start);
        //if (success)
        //{
        //    startTime = start;
        //}
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
            ProgressLabel.Text = "Processing...";
            var mediaInfo = FFProbe.Analyse(videoFile.FullPath);
            int audioStreamCount = mediaInfo.AudioStreams.Count;
            if (doMuteMic)
            {
                audioStreamCount--;
            }

            if (startTime == null || startTime.Length == 0)
            {
                Debug.WriteLine("use 0 for startTime");
                startTime = "0";
            }

            if (endTime == null || endTime.Length == 0)
            {
                Debug.WriteLine("use duration for endTime" + mediaInfo.Duration);
                endTime = mediaInfo.Duration.ToString();
            }

            string overwriteOption = doOverwrite ? "-y" : "";

            string pathMinusFileName = videoFile.FullPath.Replace(videoFile.FileName, "");
            string outputPath;
            if (outputFileName != null)
            {
                outputPath = pathMinusFileName + outputFileName + ".mp4";
            }
            else
            {
                outputPath = pathMinusFileName + "output.mp4";
            }

            Process cmd = new Process();
            cmd.StartInfo.FileName = "cmd.exe";
            cmd.StartInfo.RedirectStandardInput = true;
            cmd.StartInfo.RedirectStandardOutput = true;
            cmd.StartInfo.CreateNoWindow = true;
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