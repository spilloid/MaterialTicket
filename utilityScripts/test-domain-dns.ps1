function Test-BarracudaMX {
    param(
        [Parameter(Mandatory = $true, ValueFromPipeline = $true)]
        [string]$Domain
    )

    try {
        $mxRecords = Resolve-DnsName -Name $Domain -Type MX -ErrorAction Stop
    }
    catch {
        return [PSCustomObject]@{
            EmailDomain = $Domain
            DNSDomain = ""
        }
    }

    foreach ($record in $mxRecords) {
        if ($record.NameExchange -like "*barracudanetworks.com") {
            return [PSCustomObject]@{
                EmailDomain = $Domain
                DNSDomain = $record.NameExchange
            }
        }
    }

    return [PSCustomObject]@{
        EmailDomain = $Domain
        DNSDomain = $mxRecords[0].NameExchange
    }
}

$domains = @(
    "yorksqualityair.com","stindy.com","apotexcorp.com","beta.org","capitaleanalytics.com","carbidellc.com",
    "carmeldadsclub.org","cota.org","connectionpointe.org","conservbas.com","dellen.com","donhindsford.com",
    "duedoyle.com","dwclawyers.com","eastgateauto.com","edchoice.org","doorstoday.com","capitaleanalytics.com",
    "drivechariot.com","hisadaamerica.com","hondaoffishers.com","hoosiermetalform.com","indianaveneers.com",
    "industryinsights.com","rose-apartments.com","iumchf.org","klezmermaudlin.com","ksmcpa.com",
    "marksmenconstruction.com","MidwestBaleTies.com","ampf.com","pearsonford.com","pensionfund.org",
    "phoenixtank.com","p-massoc.com","praxisconsulting.com","salingadvisors.com",
    "getsilverback.com","stmarkscarmel.org","storage-solutions.com","blakleys.com","h4qed.org",
    "villages.org","thomasenglish.com"
)


# Collect results in an array
$results = foreach ($domain in $domains) {
    Test-BarracudaMX $domain
}

# Export the results to CSV
$results | Export-Csv -Path "BarracudaMX_results.csv" -NoTypeInformation
