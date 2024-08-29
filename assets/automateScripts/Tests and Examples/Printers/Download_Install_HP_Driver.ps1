# Define Variables (Adjust paths if needed)
$downloadURL = "https://ftp.hp.com/pub/softlib/software13/printers/UPD/upd-pcl6-x64-7.2.0.25780.exe"
$filePath = "C:/temp"
$fileName = "upd-pcl6-x64-7.2.0.25780.exe"
$zipFileName = "$fileName.zip"

# Ensure the directory exists
if (-not (Test-Path -Path $filePath)) {
    New-Item -Path $filePath -ItemType Directory | Out-Null
}

# 1. Download the EXE File
Write-Output "Downloading the file..."
Invoke-WebRequest -Uri $downloadURL -OutFile (Join-Path $filePath $fileName)

# Rename the downloaded .exe to .zip
Rename-Item -Path (Join-Path $filePath $fileName) -NewName (Join-Path $filePath $zipFileName)

# Extract driver files
Write-Host "Extracting driver files..."
try {
    Expand-Archive -Path (Join-Path $filePath $zipFileName) -DestinationPath $filePath
} catch {
    Write-Error "Error extracting driver: $_"
    exit 1
}

# 2. Register the INF Driver
Write-Output "Registering the INF driver..."
$infFilePath = Join-Path $filePath "hpcu300u.inf"  # Construct the full path
pnputil -i -a $infFilePath
Write-Output "New Driver Added: HP Universal Printing PCL 6"

# Optional: Clean Up (Uncomment if you want to delete the ZIP file)
# Remove-Item -Path (Join-Path $filePath $zipFileName) -Force
