# Ensure C:\temp directory exists
$downloadPath = "C:\temp"
If (-not (Test-Path -Path $downloadPath)) {
    New-Item -ItemType Directory -Path $downloadPath
}

# Define the URL and local download location
$url = "https://downloads.remarkable.com/desktop/production/win/reMarkable-3.10.0.845-win64.zip"
$localZipPath = Join-Path -Path $downloadPath -ChildPath "reMarkable-3.10.0.845-win64.zip"

# Download the file
Invoke-WebRequest -Uri $url -OutFile $localZipPath

# Extract the ZIP file
$extractPath = $downloadPath
Expand-Archive -Path $localZipPath -DestinationPath $extractPath -Force

# Assuming the ZIP extraction directly provides an .exe, adjust the path if necessary
$installerPath = Join-Path -Path $extractPath -ChildPath "reMarkable-3.10.0.845-win64.exe"

# Install the software with your specified arguments
Start-Process -FilePath $installerPath -ArgumentList 'in', '--al', '--da', '-c' -Wait -NoNewWindow
# Define the path for the shortcut and the target application
$shortcutPath = "C:\Users\Public\Desktop\reMarkable.lnk"
$targetPath = "C:\Program Files\reMarkable\reMarkable.exe"
$iconPath = "C:\Program Files\reMarkable\remarkable.ico"

# Use WScript.Shell to create the shortcut
$shell = New-Object -ComObject WScript.Shell
$shortcut = $shell.CreateShortcut($shortcutPath)

# Set properties for the shortcut
$shortcut.TargetPath = $targetPath
$shortcut.IconLocation = $iconPath

# Save the shortcut
$shortcut.Save()
