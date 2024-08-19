# Import necessary modules
Import-Module ConnectWiseManageAPI
Import-Module SimplySql

. ./connect.ps1

# Database connection details
$User = 'root'
$Password = 'Joseph1356'
$Database = 'Resultant'
$Server = '192.168.68.79'
$Port = 3306

# Create a credential object
$SecurePassword = ConvertTo-SecureString $Password -AsPlainText -Force
$Credential = New-Object PSCredential($User, $SecurePassword)

# Open the connection to MariaDB using SimplySql
Open-MySqlConnection -Server $Server -Database $Database -Credential $Credential -ConnectionName 'localhost' -Port $Port

# Test the connection to ensure it is open
$testConnection = Test-SqlConnection -ConnectionName 'localhost'

if ($testConnection) {
    # Connection is successful, proceed with the script

    # Get Unassigned Tickets from Team 1

    $conditions = "closedFlag = false AND summary not contains 'Wellness' AND location/name ='MS_SMB Managed Services'"

    # Get tickets based on the conditions
    $ticketsToUpdate = Get-CWMTicket -condition $conditions -all

    if ($ticketsToUpdate) {
        Write-Host "Updating Status on $(($ticketsToUpdate).Count) tickets" -ForegroundColor Yellow
        foreach ($ticket in $ticketsToUpdate) {
            Write-Host "[*] Processing Ticket: $($ticket.id)" -ForegroundColor Blue

            # Convert and validate data types
            $ticketNumber = [int]$ticket.id
            $companyName = $ticket.company.name
            $ticketTitle = $ticket.initialDescription  # Correct assignment
            $ticketSummary = $ticket.summary  # Correct assignment
            $priorityName = $ticket.priority.name

            # Extract technician information correctly
            $technician = $ticket.assignedResources | Select-Object -First 1
            if ($technician) {
                $technicianUsername = $technician.member.identifier
                $technicianFirstName = $technician.member.firstName
                $technicianLastName = $technician.member.lastName
            } else {
                $technicianUsername = $null
                $technicianFirstName = $null
                $technicianLastName = $null
            }

            # Check if the company exists
            $companyQuery = 'SELECT TitleID FROM Team1ClientList WHERE CompanyName = @CompanyName LIMIT 1;'
            $companyResult = Invoke-SqlQuery -ConnectionName 'localhost' -Query $companyQuery -Parameters @{CompanyName = $companyName}

            $companyId = if ($companyResult.Count -gt 0) { [int]$companyResult.TitleID } else { $null }

            # If the company does not exist, insert it
            if (-not $companyId) {
                $insertCompanyQuery = @'
                INSERT INTO Team1ClientList (CompanyName, Acronym, PrimaryEngagementMgr, SecondaryEngagementMgr, MSTAssigned, HelpDeskNumber, Agreement, ContactFirstName, ContactLastName, ContactEmail)
                VALUES (@CompanyName, "", "", "", "", "", "", @ContactFirstName, @ContactLastName, @ContactEmail);
'@
                try {
                    Invoke-SqlUpdate -ConnectionName 'localhost' -Query $insertCompanyQuery -Parameters @{
                        CompanyName      = $companyName
                        ContactFirstName = $ticket.contactName.Split(' ')[0]
                        ContactLastName  = $ticket.contactName.Split(' ')[1]
                        ContactEmail     = $ticket.contactEmailAddress
                    }> $null 2>&1
                    # Retrieve the newly inserted company's ID
                    $companyIdQuery = 'SELECT LAST_INSERT_ID();'
                    $companyId = Invoke-SqlQuery -ConnectionName 'localhost' -Query $companyIdQuery | Select-Object -ExpandProperty 'LAST_INSERT_ID()'
                }
                catch {
                    Write-Host "[-] Failed to insert company: $_" -ForegroundColor Red
                    continue
                }
            }

            # Check if the technician exists in the Technicians table (only if technician information is available)
            if ($technicianUsername -and $technicianFirstName -and $technicianLastName) {
                $technicianQuery = 'SELECT TechnicianID, Username, FirstName, LastName FROM Technicians WHERE Username = @Username AND FirstName = @FirstName AND LastName = @LastName LIMIT 1;'
                $technicianResult = Invoke-SqlQuery -ConnectionName 'localhost' -Query $technicianQuery -Parameters @{
                    Username  = $technicianUsername
                    FirstName = $technicianFirstName
                    LastName  = $technicianLastName
                }

                $technicianId = if ($technicianResult.Count -gt 0) { [int]$technicianResult.TechnicianID } else { $null }

                # If the technician does not exist, insert them
                if (-not $technicianId) {
                    $insertTechnicianQuery = @'
                    INSERT INTO Technicians (Username, FirstName, LastName)
                    VALUES (@Username, @FirstName, @LastName);
'@
                    try {
                        Invoke-SqlUpdate -ConnectionName 'localhost' -Query $insertTechnicianQuery -Parameters @{
                            Username  = $technicianUsername
                            FirstName = $technicianFirstName
                            LastName  = $technicianLastName
                        }> $null 2>&1
                        # Retrieve the newly inserted technician's ID
                        $technicianIdQuery = 'SELECT LAST_INSERT_ID();'
                        $technicianId = Invoke-SqlQuery -ConnectionName 'localhost' -Query $technicianIdQuery | Select-Object -ExpandProperty 'LAST_INSERT_ID()'
                    }
                    catch {
                        Write-Host "[-] Failed to insert technician: $_" -ForegroundColor Red
                        continue
                    }
                }
            }

            # Check if the ticket already exists in the Tickets table
            $ticketCheckQuery = 'SELECT ticketnumber, company, ticketTitle, ticketSummary, priority, technician FROM Tickets WHERE ticketnumber = @TicketID LIMIT 1;'
            $existingTicket = Invoke-SqlQuery -ConnectionName 'localhost' -Query $ticketCheckQuery -Parameters @{TicketID = $ticketNumber}

            if ($existingTicket.Count -eq 0) {
                # If the ticket does not exist, insert it
                try {
                    $insertTicketQuery = @'
                    INSERT INTO Tickets (ticketnumber, company, ticketTitle, ticketSummary, priority, technician)
                    VALUES (@TicketID, @CompanyID, @TicketTitle, @TicketSummary, @Priority, @TechnicianID);
'@
                    Invoke-SqlUpdate -ConnectionName 'localhost' -Query $insertTicketQuery -Parameters @{
                        TicketID      = $ticketNumber
                        CompanyID     = $companyId
                        TicketTitle   = $ticketTitle
                        TicketSummary = $ticketSummary
                        Priority      = $priorityName
                        TechnicianID  = $technicianId
                    } > $null 2>&1
                    Write-Host "[+] Successfully added ticket" -ForegroundColor Green
                }
                catch {
                    Write-Host "[-] Failed to add ticket: $_" -ForegroundColor Red
                }
            } else {
                # If the ticket exists, update the details if necessary
                $existingCompanyID = [int]$existingTicket.company
                $existingTitle = $existingTicket.ticketTitle
                $existingSummary = $existingTicket.ticketSummary
                $existingPriority = $existingTicket.priority
                $existingTechnicianID = $existingTicket.technician

                if ($existingCompanyID -ne $companyId -or $existingTitle -ne $ticketTitle -or $existingSummary -ne $ticketSummary -or $existingPriority -ne $priorityName -or $existingTechnicianID -ne $technicianId) {
                    try {
                        $updateTicketQuery = @'
                        UPDATE Tickets
                        SET company = @CompanyID, ticketTitle = @TicketTitle, ticketSummary = @TicketSummary, priority = @Priority, technician = @TechnicianID
                        WHERE ticketnumber = @TicketID;
'@
                        Invoke-SqlUpdate -ConnectionName 'localhost' -Query $updateTicketQuery -Parameters @{
                            TicketID      = $ticketNumber
                            CompanyID     = $companyId
                            TicketTitle   = $ticketTitle
                            TicketSummary = $ticketSummary
                            Priority      = $priorityName
                            TechnicianID  = $technicianId
                        } > $null 2>&1
                        Write-Host "[+] Successfully updated ticket" -ForegroundColor Green
                    }
                    catch {
                        Write-Host "[-] Failed to update ticket: $_" -ForegroundColor Red
                    }
                } else {
                    Write-Host "[*] No update needed for ticket" -ForegroundColor Blue
                }
            }
        }
    } else {
        Write-Host "[!] No tickets found for update" -ForegroundColor Yellow
    }

    # Close the SQL connection
    Close-SqlConnection -ConnectionName 'localhost'
} else {
    Write-Host "[-] Failed to connect to the database." -ForegroundColor Red
}
