function Get-PrinterInfo {
    $log = ""
    Get-WmiObject -Class Win32_Printer -ComputerName localhost | ForEach-Object {
        $portName = $_.PortName
        $tcpPort = Get-WmiObject -Class Win32_TCPIPPrinterPort -ComputerName localhost | Where-Object { $_.Name -eq $portName }
        $mappingMethod = if ($tcpPort) { $tcpPort.HostAddress } else { $_.Location }

        if (-not $mappingMethod) { $mappingMethod = "N/A" }

        $name = $_.Name.PadRight(10)
        $driver = $_.DriverName.PadRight(10)
        $location = $mappingMethod

        $log += "$name $driver $location`n" # Add a new line for each entry
    }
    return $log  # Return the entire log
}

$printerLog = Get-PrinterInfo  # Call the function to get the log

Write-Output $printerLog        # Output the log