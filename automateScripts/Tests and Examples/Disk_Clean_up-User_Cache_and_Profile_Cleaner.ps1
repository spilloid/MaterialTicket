# Define the path where the folders are located
$usersPath = "C:\users"
# Define the empty folder's path (ensure this is properly set up before running the script)
$emptyFolderPath = "C:\users\empty"
# Get today's date
$today = Get-Date
# Calculate the date 90 days ago
$daysAgo90 = $today.AddDays(-90)


# Check if the folder exists
if (Test-Path $emptyFolderPath) {
    # Delete the folder if it exists
    Remove-Item -Path $emptyFolderPath -Recurse -Force
}

# Create the folder
New-Item -Path $emptyFolderPath -ItemType Directory

# Get all directories in the specified path that were modified more than 90 days ago
$oldFolders = Get-ChildItem -Path $usersPath -Directory | Where-Object {
    $_.LastWriteTime -lt $daysAgo90
}

# Output the folders that will be processed
Write-Host "Folders identified for deletion:"
$oldFolders | ForEach-Object {
    Write-Host $_.FullName
}
$oldFolders | ForEach-Object {
     # Run robocopy to mirror the empty folder to the target folder
    robocopy $emptyFolderPath $folder.FullName /mir /nfl /ndl

    # Remove the folder after clearing it
    Remove-Item -Path $folder.FullName -Force
}

# delete updater cache:
robocopy $emptyFolderPath "%systemdrive%\Windows\Temp" /mir /nfl /ndl
net stop wuauserv
$updateCachePath = "C:\Windows\SoftwareDistribution\Download"
robocopy $emptyFolderPath $updateCachePath /mir /nfl /ndl
net start wuauserv