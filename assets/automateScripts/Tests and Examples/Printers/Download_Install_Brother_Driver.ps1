

# Define Variables (Adjust paths if needed)
$downloadURL = "https://download.brother.com/welcome/dlf004694/UNIV-PCL-0111.EXE"
$zipFilePath = "UNIV_5.979.3.0_PCL6_x64.zip"
$extractionPath = ".\UNIV_5.979.3.0_PCL6_x64"  # Folder to extract to (in the current directory)

# 1. Download the ZIP File
Write-Output "Downloading the ZIP file..."
Invoke-WebRequest -Uri $downloadURL -OutFile $zipFilePath

# 2. Extract the ZIP File
Write-Output "Extracting the ZIP file..."
Expand-Archive -Path $zipFilePath -DestinationPath $extractionPath

# 3. Register the INF Driver
Write-Output "Registering the INF driver..."
$infFilePath = Join-Path $extractionPath "x3UNIVX.inf"  # Construct the full path
pnputil -i -a $infFilePath
Write-Output "New Driver Added: Xerox Global Print Driver"
# Optional: Clean Up (Uncomment if you want to delete the ZIP file)
# Remove-Item -Path $zipFilePath -Force
