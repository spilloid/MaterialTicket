function Grab-File-From-AD {
    param(
        [Parameter(Mandatory)]
        [string] $Username,

        [Parameter(Mandatory)]
        [string] $Password,

        [Parameter(Mandatory)]
        [string] $SourcePath,

        [Parameter(Mandatory)]
        [string] $DestinationPath,

        [Parameter()]
        [string] $FileName = "*"  # Default to copy all files if not specified
    )

    # Input Validation
    if (!(Test-Path -Path $SourcePath -PathType Container)) {
        Write-Error "Source path '$SourcePath' is not a valid directory."
        return
    }

    # Authentication and Error Handling
    try {
        # Attempt to authenticate using the provided credentials
        $netResult = net use $SourcePath /user:$Username $Password
        if ($netResult.StartsWith('System error')) {
            throw "Authentication failed. Please check your username and password."
        }

        # Copy files, handling potential issues
        $robocopyResult = robocopy $SourcePath $DestinationPath $FileName /Z /NP /E /R:3 /W:5
        if ($LASTEXITCODE -ne 0 -and $LASTEXITCODE -ne 1) {  # 1 means some files copied
            throw "Robocopy failed with exit code: $LASTEXITCODE"
        }

    } catch {
        Write-Error "Error occurred: $_"
        return
    } finally {
        # Always disconnect, even if an error occurred
        net use $SourcePath /delete
    }

    Write-Output "Files copied successfully!"
}
