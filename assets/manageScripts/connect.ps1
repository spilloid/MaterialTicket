# Load environment variables from .env file
Import-Module dotenv
$envPath = "$PSScriptRoot/.env"
if (Test-Path $envPath) {
    dotenv $envPath
} else {
    Write-Error "Environment file not found at $envPath"
    exit 1
}

# Create the connection info using environment variables
$CWMConnectionInfo = @{
    Server      = $env:CWM_SERVER
    Company     = $env:CWM_COMPANY
    pubkey      = $env:CWM_PUBKEY
    privatekey  = $env:CWM_PRIVATEKEY
    clientid    = $env:CWM_CLIENTID
}

# Install/Update/Load the module
# if(Get-InstalledModule 'ConnectWiseManageAPI' -ErrorAction SilentlyContinue){ Update-Module 'ConnectWiseManageAPI' -Verbose }
# else{ Install-Module 'ConnectWiseManageAPI' -Verbose }
Import-Module 'ConnectWiseManageAPI'

# Connect to your Manage server
Connect-CWM @CWMConnectionInfo -Force -Verbose
