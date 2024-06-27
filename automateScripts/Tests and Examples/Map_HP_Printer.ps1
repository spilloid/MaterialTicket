# Define variables
$printerIP = "192.224.187.111"
$printerName = "CDK Printer"
$driverDownloadUrl = "https://ftp.hp.com/pub/softlib/software13/printers/UPD/upd-pcl6-x64-7.2.0.25780.exe"
$driverFileName = "upd-pcl6-x64-7.2.0.25780.exe"
$driverZipFileName = "upd-pcl6-x64-7.2.0.25780.zip" # Renamed to .zip
$driverExtractionPath = Join-Path $env:TEMP "hp_driver_temp"
$driverInfFile = Join-Path $driverExtractionPath "hpcu300u.inf"

# Download the driver installer (if it doesn't exist already)
if (!(Test-Path $driverExtractionPath)) {
    New-Item -Path $driverExtractionPath -ItemType Directory | Out-Null
}

if (!(Test-Path (Join-Path $driverExtractionPath $driverFileName))) {
    Write-Host "Downloading printer driver..."
    try {
        Invoke-WebRequest -Uri $driverDownloadUrl -OutFile (Join-Path $driverExtractionPath $driverFileName)
    } catch {
        Write-Error "Error downloading driver: $_"
        exit 1
    }
}

# Rename the downloaded .exe to .zip
Rename-Item -Path (Join-Path $driverExtractionPath $driverFileName) -NewName $driverZipFileName

# Extract driver files
Write-Host "Extracting driver files..."
try {
    Expand-Archive -Path (Join-Path $driverExtractionPath $driverZipFileName) -DestinationPath $driverExtractionPath
} catch {
    Write-Error "Error extracting driver: $_"
    exit 1
}

# Add printer port (assuming TCP/IP port)
$portName = "IP_$printerIP" # Create a port name based on the IP
if (!(Get-PrinterPort -Name $portName)) {  # Check if port already exists
    Add-PrinterPort -Name $portName -PrinterHostAddress $printerIP
}

# Register the printer driver via pnputil
& pnputil -i -a $driverInfFile

# Add the printer driver
Add-PrinterDriver -Name $printerName

# Add the printer itself
Add-Printer -Name $printerName -DriverName $printerName -PortName $portName

# Cleanup
Remove-Item -Path $driverExtractionPath -Recurse -Force  # Delete temporary folder
