# Define the cache file path
$cacheFilePath = ".\groupMembersCache.json"

# Function to check if cache is valid
function Is-CacheValid {
    param (
        [string]$filePath
    )
    if (-Not (Test-Path $filePath)) {
        return $false
    }
    $cache = Get-Content -Path $filePath | ConvertFrom-Json
    $lastUpdated = [datetime]$cache.LastUpdated
    return (New-TimeSpan -Start $lastUpdated).TotalHours -lt 24
}

# Function to load cached group members
function Load-CachedGroupMembers {
    param (
        [string]$filePath
    )
    $cache = Get-Content -Path $filePath | ConvertFrom-Json
    return $cache.DistributionGroupMembers
}

# Function to save group members to cache
function Save-GroupMembersToCache {
    param (
        [string]$filePath,
        [array]$groupMembers
    )
    $cache = @{
        LastUpdated = (Get-Date).ToString("o")
        DistributionGroupMembers = $groupMembers
    }
    $cache | ConvertTo-Json | Set-Content -Path $filePath
}

# Prompt for source and destination users
$sourceUser = Read-Host -Prompt "Enter the source user's UPN or ObjectId"
$destinationUser = Read-Host -Prompt "Enter the destination user's UPN or ObjectId"

# Function to handle Azure AD calls with error handling
function Execute-AzureADCommand {
    param (
        [ScriptBlock]$Command
    )
    try {
        return &$Command
    } catch {
        Write-Host " Error: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Retrieve the user objects to get their ObjectIds
function Get-UserObject {
    param (
        [string]$userIdentifier
    )
    $userObject = Execute-AzureADCommand {
        Get-AzureADUser -ObjectId $userIdentifier -ErrorAction Stop
    }
    if (-not $userObject) {
        $userObject = Execute-AzureADCommand {
            Get-AzureADUser -Filter "UserPrincipalName eq '$userIdentifier'" -ErrorAction Stop
        }
    }
    return $userObject
}

Write-Host "Retrieving source user object..." -ForegroundColor Cyan -NoNewline
$sourceUserObject = Get-UserObject $sourceUser

Write-Host "Retrieving destination user object..." -ForegroundColor Cyan -NoNewline
$destinationUserObject = Get-UserObject $destinationUser

# Check if the users were found
if (-not $sourceUserObject) {
    Write-Host "Source user not found." -ForegroundColor Red
    exit
}
if (-not $destinationUserObject) {
    Write-Host "Destination user not found." -ForegroundColor Red
    exit
}

# Retrieve all groups the source user is a member of
Write-Host "Retrieving source user groups..." -ForegroundColor Cyan -NoNewline
$sourceUserGroups = Execute-AzureADCommand {
    Get-AzureADUserMembership -ObjectId $sourceUserObject.ObjectId -ErrorAction Stop
}

# Retrieve all groups the destination user is a member of
Write-Host "Retrieving destination user groups..." -ForegroundColor Cyan -NoNewline
$destinationUserGroups = Execute-AzureADCommand {
    Get-AzureADUserMembership -ObjectId $destinationUserObject.ObjectId -ErrorAction Stop
}

# Get only the group display names
$sourceGroupNames = $sourceUserGroups.DisplayName
$destinationGroupNames = $destinationUserGroups.DisplayName

# Compare the groups and find the groups the destination user is not a member of
Write-Host "Comparing source and destination user groups..." -ForegroundColor Cyan
$groupsToAdd = $sourceGroupNames | Where-Object { $_ -notin $destinationGroupNames }

# Retrieve all distribution groups and their members, using cache if valid
if (Is-CacheValid -filePath $cacheFilePath) {
    Write-Host "Loading distribution group members from cache..." -ForegroundColor Cyan
    $distributionGroupMembers = Load-CachedGroupMembers -filePath $cacheFilePath
} else {
    Write-Host "Retrieving all distribution groups and their members..." -ForegroundColor Cyan -NoNewline
    $distributionGroups = Execute-AzureADCommand {
        Get-DistributionGroup -ErrorAction Stop
    }
    $distributionGroupMembers = @()

    foreach ($distro in $distributionGroups) {
        Write-Host "Retrieving members of distribution group $($distro.Name)..." -ForegroundColor Cyan -NoNewline
        $members = Execute-AzureADCommand {
            Get-DistributionGroupMember -Identity $distro.Name -ErrorAction Stop
        }
        foreach ($member in $members) {
            $distributionGroupMembers += [pscustomobject]@{
                DistributionGroupName = $distro.Name
                MemberName            = $member.Name
                PrimarySMTPAddress    = $member.PrimarySMTPAddress
            }
        }
    }

    # Save the retrieved group members to cache
    Save-GroupMembersToCache -filePath $cacheFilePath -groupMembers $distributionGroupMembers
}

# Find distribution groups the source user is a member of
Write-Host "Finding distribution groups the source user is a member of..." -ForegroundColor Cyan
$sourceUserDistributionGroups = $distributionGroupMembers | Where-Object { $_.PrimarySMTPAddress -eq $sourceUserObject.Mail }

# Find distribution groups the destination user is not a member of
Write-Host "Finding distribution groups the destination user is not a member of..." -ForegroundColor Cyan
$destinationUserDistributionGroups = $distributionGroupMembers | Where-Object { $_.PrimarySMTPAddress -eq $destinationUserObject.Mail }
$distributionGroupsToAdd = $sourceUserDistributionGroups | Where-Object { $_.DistributionGroupName -notin $destinationUserDistributionGroups.DistributionGroupName }

# Display the groups and distribution groups that will be added to the destination user for approval
Write-Host "The following groups will be added to $($destinationUserObject.UserPrincipalName):" -ForegroundColor Yellow
$groupsToAdd | ForEach-Object { Write-Host $_ }

Write-Host "The following distribution groups will be added to $($destinationUserObject.UserPrincipalName):" -ForegroundColor Yellow
$distributionGroupsToAdd.DistributionGroupName | ForEach-Object { Write-Host $_ }

# Ask for user approval to proceed
$approval = Read-Host -Prompt "Do you want to proceed with adding these groups to the destination user? (y/n, default is n)"

# Default approval to 'n' if no input or not 'y' or 'Y'
if ($approval -ne 'y' -and $approval -ne 'Y') {
    $approval = 'n'
}

if ($approval -eq "y" -or $approval -eq "Y") {
    Write-Host "Adding groups to the destination user..." -ForegroundColor Cyan

    # Get the group objects for the groups to be added
    $groupsToAddObjects = $sourceUserGroups | Where-Object { $_.DisplayName -in $groupsToAdd }

    # Add destination user to each group
    foreach ($group in $groupsToAddObjects) {
        Write-Host "Adding $($destinationUserObject.UserPrincipalName) to group $($group.DisplayName)..." -ForegroundColor Cyan -NoNewline
        Execute-AzureADCommand {
            Add-AzureADGroupMember -ObjectId $group.ObjectId -RefObjectId $destinationUserObject.ObjectId -ErrorAction Stop
        }
    }

    # Add destination user to each distribution group
    foreach ($distro in $distributionGroupsToAdd) {
        Write-Host "Adding $($destinationUserObject.UserPrincipalName) to distribution group $($distro.DistributionGroupName)..." -ForegroundColor Cyan -NoNewline
        Execute-AzureADCommand {
            Add-DistributionGroupMember -Identity $distro.DistributionGroupName -Member $destinationUserObject.Mail -ErrorAction Stop
        }
    }

    Write-Host "All groups and distribution groups have been successfully copied from $($sourceUserObject.UserPrincipalName) to $($destinationUserObject.UserPrincipalName)." -ForegroundColor Green
} else {
    Write-Host "Operation cancelled by user." -ForegroundColor Red
}
