param(
 [Parameter(Mandatory=$true)][string]$SourceCsv,
 [string]$OutputPath=(Join-Path $PSScriptRoot '..\data\vehicle-applications.js'),
 [string]$RetrievedDate=(Get-Date -Format 'yyyy-MM-dd')
)

$source=(Resolve-Path -LiteralPath $SourceCsv).Path
$rows=Import-Csv -LiteralPath $source
$applications=$rows | ForEach-Object {
 $model=if($_.baseModel){$_.baseModel}else{$_.model}
 $submodel=if($_.model -ne $model){$_.model}else{$null}
 [pscustomobject][ordered]@{
  year=[int]$_.year
  make=$_.make
  model=$model
  submodel=$submodel
  trim=$null
  source='U.S. DOE/EPA FuelEconomy.gov'
  verificationStatus='VERIFIED_SOURCE_RECORD'
 }
} | Sort-Object year,make,model,submodel -Unique

$years=$applications.year | Sort-Object -Unique
$makes=$applications.make | Sort-Object -Unique
$models=$applications | ForEach-Object { "$($_.make)|$($_.model)" } | Sort-Object -Unique
$withSubmodel=($applications | Where-Object { $_.submodel -or $_.trim }).Count
$hash=(Get-FileHash -LiteralPath $source -Algorithm SHA256).Hash.ToLowerInvariant()
$payload=[pscustomobject][ordered]@{
 schemaVersion=1
 source=[pscustomobject][ordered]@{
  name='U.S. DOE/EPA FuelEconomy.gov'
  url='https://www.fueleconomy.gov/feg/epadata/vehicles.csv.zip'
  retrieved=$RetrievedDate
  sha256=$hash
  sourceRowCount=$rows.Count
 }
 coverage=[pscustomobject][ordered]@{
  applicationRecordCount=$applications.Count
  minimumYear=($years | Measure-Object -Minimum).Minimum
  maximumYear=($years | Measure-Object -Maximum).Maximum
  yearCount=$years.Count
  makeCount=$makes.Count
  modelCount=$models.Count
  recordsWithSubmodelOrTrim=$withSubmodel
  submodelOrTrimPercentage=[math]::Round(100*$withSubmodel/$applications.Count,2)
 }
 applications=$applications
}

$json=$payload | ConvertTo-Json -Depth 6 -Compress
$javascript="(function(root){'use strict';root.CARB_TUNE_VEHICLE_APPLICATIONS=$json;})(window);`n"
$resolvedOutput=[System.IO.Path]::GetFullPath($OutputPath)
[System.IO.Directory]::CreateDirectory([System.IO.Path]::GetDirectoryName($resolvedOutput)) | Out-Null
[System.IO.File]::WriteAllText($resolvedOutput,$javascript,[System.Text.UTF8Encoding]::new($false))
Write-Output "Generated $($applications.Count) relational application records at $resolvedOutput"
