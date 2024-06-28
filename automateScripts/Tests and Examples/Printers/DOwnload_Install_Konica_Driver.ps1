# Define Variables (Adjust paths if needed)
$downloadURL = "https://p.knova.konicaminolta.com/PublicDownload/download?fileId=0482F2A0-AB1D-46B8-A304-86CEED9D685C"
$zipFilePath = "UPD4PCL6Win81P_2400MU.zip"
$extractionPath = ".\UPD4PCL6Win81P_2400MU"  # Folder to extract to (in the current directory)

# 1. Download the ZIP File
Write-Output "Downloading the ZIP file..."
Invoke-WebRequest -Uri $downloadURL -OutFile $zipFilePath

# 2. Extract the ZIP File
Write-Output "Extracting the ZIP file..."
Expand-Archive -Path $zipFilePath -DestinationPath $extractionPath

# 3. Register the INF Driver
Write-Output "Registering the INF driver..."
$infFilePath = Join-Path $extractionPath "KOBxxK__01.inf"  # Construct the full path
pnputil -i -a $infFilePath
Write-Output "New Driver Added: KONICA MINOLTA Universal V4 PCL"
# Optional: Clean Up (Uncomment if you want to delete the ZIP file)
# Remove-Item -Path $zipFilePath -Force
