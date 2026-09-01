param(
    [string]$SourceDirectory = (Join-Path $env:TEMP 'carbtune-vehicle-audit'),
    [string]$OutputPath = (Join-Path $PSScriptRoot '..\data\vehicle-historical-applications.js'),
    [int]$MaximumModelYear = 1983,
    [string]$RetrievedDate = '2026-08-28'
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$sources = @(
    [ordered]@{
        Name = 'FLAT_RCL_PRE_2010.zip'
        Url = 'https://static.nhtsa.gov/odi/ffdd/rcl/FLAT_RCL_PRE_2010.zip'
    },
    [ordered]@{
        Name = 'FLAT_RCL_POST_2010.zip'
        Url = 'https://static.nhtsa.gov/odi/ffdd/rcl/FLAT_RCL_POST_2010.zip'
    }
)

New-Item -ItemType Directory -Force -Path $SourceDirectory | Out-Null
foreach ($source in $sources) {
    $sourcePath = Join-Path $SourceDirectory $source.Name
    if (-not (Test-Path -LiteralPath $sourcePath)) {
        Invoke-WebRequest -Uri $source.Url -OutFile $sourcePath
    }
}

Add-Type -AssemblyName System.IO.Compression.FileSystem

$minimumModelYear = 1900
$applications = @{}
$placeholderValues = [System.Collections.Generic.HashSet[string]]::new([StringComparer]::OrdinalIgnoreCase)
@('UNKNOWN', 'OTHER', 'N/A', 'NA', 'NONE', 'NOT APPLICABLE', 'NOT LISTED', 'UNK') |
    ForEach-Object { [void]$placeholderValues.Add($_) }

function Normalize-SourceText([string]$value) {
    return [regex]::Replace($value.Trim(), '\s+', ' ')
}

foreach ($source in $sources) {
    $sourcePath = Join-Path $SourceDirectory $source.Name
    $zip = [IO.Compression.ZipFile]::OpenRead($sourcePath)
    try {
        foreach ($entry in $zip.Entries) {
            if (-not $entry.FullName.EndsWith('.txt', [StringComparison]::OrdinalIgnoreCase)) {
                continue
            }

            $reader = [IO.StreamReader]::new($entry.Open())
            try {
                while (($line = $reader.ReadLine()) -ne $null) {
                    $fields = $line.Split("`t", 12)
                    if ($fields.Length -lt 11 -or $fields[10].Trim() -ne 'V') {
                        continue
                    }

                    $year = 0
                    if (-not [int]::TryParse($fields[4].Trim(), [ref]$year) -or
                        $year -lt $minimumModelYear -or $year -gt $MaximumModelYear) {
                        continue
                    }

                    $make = Normalize-SourceText $fields[2]
                    $model = Normalize-SourceText $fields[3]
                    if (-not $make -or -not $model -or
                        $placeholderValues.Contains($make) -or
                        $placeholderValues.Contains($model) -or
                        [StringComparer]::OrdinalIgnoreCase.Equals($make, $model)) {
                        continue
                    }

                    $key = "$year`u{001F}$make`u{001F}$model"
                    if (-not $applications.ContainsKey($key)) {
                        $applications[$key] = [pscustomobject][ordered]@{
                            year = $year
                            make = $make
                            model = $model
                            submodel = $null
                            trim = $null
                            source = 'NHTSA ODI vehicle recall application records'
                            verificationStatus = 'SOURCE_RECORDED_APPLICATION'
                        }
                    }
                }
            }
            finally {
                $reader.Dispose()
            }
        }
    }
    finally {
        $zip.Dispose()
    }
}

$orderedApplications = @($applications.Values | Sort-Object year, make, model)
$years = @($orderedApplications.year | Sort-Object -Unique)
$makes = @($orderedApplications.make | Sort-Object -Unique)
$models = @($orderedApplications | ForEach-Object { "$($_.make)|$($_.model)" } | Sort-Object -Unique)
$payload = [pscustomobject][ordered]@{
    schemaVersion = 1
    source = [pscustomobject][ordered]@{
        name = 'NHTSA Office of Defects Investigation vehicle recall applications'
        url = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis'
        files = @($sources.Url)
        retrieved = $RetrievedDate
        modelYearLimit = $MaximumModelYear
        recordType = 'Vehicle recall application rows (RCLTYPECD=V)'
    }
    coverage = [pscustomobject][ordered]@{
        applicationRecordCount = $orderedApplications.Count
        minimumYear = ($years | Measure-Object -Minimum).Minimum
        maximumYear = ($years | Measure-Object -Maximum).Maximum
        yearCount = $years.Count
        makeCount = $makes.Count
        modelCount = $models.Count
        recordsWithSubmodelOrTrim = 0
        submodelOrTrimPercentage = 0
    }
    applications = $orderedApplications
}

$json = $payload | ConvertTo-Json -Depth 6 -Compress
$javascript = "(function(root){'use strict';root.CARB_TUNE_HISTORICAL_VEHICLE_APPLICATIONS=$json;})(window);`n"
$resolvedOutput = [IO.Path]::GetFullPath($OutputPath)
[IO.Directory]::CreateDirectory([IO.Path]::GetDirectoryName($resolvedOutput)) | Out-Null
[IO.File]::WriteAllText($resolvedOutput, $javascript, [Text.UTF8Encoding]::new($false))

Write-Output "Generated $($orderedApplications.Count) historical year/make/model application records across $($years.Count) years and $($makes.Count) makes."
Write-Output "Output: $resolvedOutput"
