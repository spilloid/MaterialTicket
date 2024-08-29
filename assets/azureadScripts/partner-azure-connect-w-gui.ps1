# Improved PowerShell Script for Connecting to Partner Center and Authenticating to O365 Tenants

function DrawMenu {
    param ($menuItems, $menuPosition, $menuTitle, $pageSize, $currentPage, $filterText)
    $fcolor = 'Cyan'
    $bcolor = 'DarkGray'
    $hcolor = 'Yellow'
    cls
    $menuwidth = $menuTitle.length + 4
    Write-Host "`t" -NoNewLine
    Write-Host ("*" * $menuwidth) -fore 'Magenta' -back 'Black'
    Write-Host "`t" -NoNewLine
    Write-Host "* $menuTitle *" -fore 'Green' -back 'Black'
    Write-Host "`t" -NoNewLine
    Write-Host ("*" * $menuwidth) -fore 'Magenta' -back 'Black'
    Write-Host ""

    # Filter menu items based on filterText
    $filteredMenuItems = $menuItems | Where-Object { $_ -like "*$filterText*" }

    $start = $currentPage * $pageSize
    $end = [Math]::Min(($start + $pageSize), $filteredMenuItems.Count)

    for ($i = $start; $i -lt $end; $i++) {
        Write-Host "`t" -NoNewLine
        if ($i -eq ($start + $menuPosition)) {
            Write-Host "$($filteredMenuItems[$i])" -fore $hcolor -back $bcolor
        } else {
            Write-Host "$($filteredMenuItems[$i])" -fore $fcolor -back $bcolor
        }
    }

    # Display filter section on the bottom left
    Write-Host "`nFilter: $filterText" -fore 'White' -back 'Black' -NoNewline

    # Calculate and display the count of displayed items and total filtered items
    $displayedItemCount = $filteredMenuItems.Count
    $totalFilteredItems = $menuItems.Count
    $infoText = "$displayedItemCount of $totalFilteredItems items"
    $padding = $host.UI.RawUI.BufferSize.Width - ($infoText.Length + $filterText.Length + 20)
    Write-Host (" " * $padding) -NoNewline
    Write-Host $infoText -fore 'White' -back 'Black'

    # Display pagination information
    $totalPages = [Math]::Ceiling($filteredMenuItems.Count / $pageSize)
    Write-Host "`nPage $($currentPage + 1) of $totalPages" -fore 'White' -back 'Black'
}

function Menu {
    param ([array]$menuItems, $menuTitle = "MENU", $pageSize = 10)
    $vkeycode = 0
    $pos = 0
    $currentPage = 0
    $totalPages = [Math]::Ceiling($menuItems.Count / $pageSize)
    $filterText = ""

    DrawMenu $menuItems $pos $menuTitle $pageSize $currentPage $filterText

    While ($vkeycode -ne 13) { # 13 is Enter
        $press = $host.ui.rawui.readkey("NoEcho,IncludeKeyDown")
        $vkeycode = $press.virtualkeycode
        Switch ($vkeycode) {
            38 { # Up arrow
                $pos--
                if ($pos -lt 0) {
                    $currentPage--
                    if ($currentPage -lt 0) { $currentPage = $totalPages - 1 }
                    $pos = $pageSize - 1
                }
            }
            40 { # Down arrow
                $pos++
                if ($pos -ge $pageSize) {
                    $currentPage++
                    if ($currentPage -ge $totalPages) { $currentPage = 0 }
                    $pos = 0
                }
            }
            37 { # Left arrow
                $currentPage--
                if ($currentPage -lt 0) { $currentPage = $totalPages - 1 }
                $pos = 0
            }
            39 { # Right arrow
                $currentPage++
                if ($currentPage -ge $totalPages) { $currentPage = 0 }
                $pos = 0
            }
            Default {
                # Handle character input for filter
                if ($vkeycode -ge 65 -and $vkeycode -le 90) { # A-Z keys
                    $char = [char]$vkeycode
                    $filterText += $char
                } elseif ($vkeycode -eq 8) { # Backspace
                    $filterText = $filterText.Substring(0, [Math]::Max($filterText.Length - 1, 0))
                }
            }
        }
        DrawMenu $menuItems $pos $menuTitle $pageSize $currentPage $filterText
    }

    # Logic for returning the selected item
    $filteredMenuItems = $menuItems | Where-Object { $_ -like "*$filterText*" }
    $globalSelectionIndex = ($currentPage * $pageSize) + $pos
    if ($globalSelectionIndex -lt $filteredMenuItems.Count) {
        return $filteredMenuItems[$globalSelectionIndex]
    } else {
        return $null
    }
}

# Function to connect to Partner Center silently
function Connect-PartnerCenterSilently {
    try {
        $partnerContext = Get-PartnerContext
        if ($null -eq $partnerContext) {
            Write-Host "Establishing new connection to Partner Center..." -ForegroundColor Cyan
            Connect-PartnerCenter | Out-Null
            return $false
        } else {
            return $true
        }
    } catch {
        Write-Host "Error encountered. Reconnecting to Partner Center..." -ForegroundColor Yellow
        Connect-PartnerCenter | Out-Null
        return $false
    }
}

# Function to display and select clients with GUI menu
function DisplayAndSelectClient($customerList) {
    $menuItems = $customerList | ForEach-Object { "$($_.Name) ($($_.Domain))" }
    $selection = Menu $menuItems "Select Client:"
    if ($null -eq $selection) {
        Write-Host "Menu selection cancelled." -ForegroundColor Yellow
        return $null
    }
    $selectedClient = $customerList | Where-Object { "$($_.Name) ($($_.Domain))" -eq $selection }
    return $selectedClient
}

# Main script execution with improved error handling and color-coded output
try {
    $starLine = "*`t*`t*`t*`t*`t*`t*`t*`t*`t*`t*`t*`t*`t*`t*`t*`t*`t*`t*`t*`r"
    Write-Host $starLine -ForegroundColor Cyan
    if (Connect-PartnerCenterSilently) {
        Write-Host "Successfully connected to Partner Center." -ForegroundColor Green
        Write-Host $starLine -ForegroundColor Cyan -nonewLine
    } else {
        Write-Host "Connection to Partner Center established after reconnection attempt." -ForegroundColor Yellow
        Write-Host $starLine -ForegroundColor Cyan -nonewLine
    }

    $customerList = Get-PartnerCustomer
    $selectedClient = DisplayAndSelectClient $customerList

    if ($selectedClient) {
        Connect-AzureAD -TenantId $selectedClient.CustomerId -ErrorAction Stop | Out-Null
        Write-Host $starLine -ForegroundColor Cyan -nonewLine
        Write-Host "Connected to AzureAD for $($selectedClient.Name)." -ForegroundColor Green
        Write-Host $starLine -ForegroundColor Cyan -nonewLine
        $ENV:azure_client_name = $selectedClient.Name
        $additionalServices = Read-Host "Connect to ExchangeOnline? (Y/N)"
        if ($additionalServices -eq 'Y') {
            Connect-ExchangeOnline -DelegatedOrganization $selectedClient.CustomerId | Out-Null
            Write-Host $starLine -ForegroundColor Cyan -nonewLine
            Write-Host "EXO connected!" -ForegroundColor Green
            Write-Host $starLine -ForegroundColor Cyan -nonewLine
        }
        $intunegraph = Read-Host "Connect to MS Intune Graph? (Y/N)"
        if ($intunegraph -eq 'Y') {
            Connect-MSIntuneGraph -TenantID $selectedClient.CustomerId -Interactive -ErrorAction Stop | Out-Null
            Write-Host $starLine -ForegroundColor Cyan -nonewLine
            Write-Host "Intune Graph connected!" -ForegroundColor Green
            Write-Host $starLine -ForegroundColor Cyan -nonewLine
        }
    }
} catch {
    Write-Host "An error occurred: $_" -ForegroundColor Red
}
