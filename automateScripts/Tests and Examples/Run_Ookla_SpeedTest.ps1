# Define the URL and file paths
$zipUrl = "https://install.speedtest.net/app/cli/ookla-speedtest-1.2.0-win64.zip"
$zipFile = "ookla-speedtest-1.2.0-win64.zip"
$extractPath = "C:\public\speed_tests"
$speedtestPath = "$extractPath\speedtest.exe"

# Create the directory if it doesn't exist
if (-Not (Test-Path -Path $extractPath)) {
    New-Item -ItemType Directory -Path $extractPath -Force -ErrorAction SilentlyContinue
}

# Download the zip file
Invoke-WebRequest -Uri $zipUrl -OutFile $zipFile

# Extract the zip file
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::ExtractToDirectory($zipFile, $extractPath)

# Generate the timestamped filename
$timestamp = Get-Date -Format "yyyy-MM-dd_HH.mm"
$resultFile = "$extractPath\speedtest_result_$timestamp.json"

# Perform the speed test silently and output the result in JSON format
& $speedtestPath --accept-license --format=json --progress=no | Out-File -FilePath $resultFile

# Display the result
Get-Content $resultFile
