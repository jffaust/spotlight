#Connect-AzAccount -Tenant c85b3b44-2712-411a-9cff-bac2e4f8cd77 -Subscription Dev

$storageRG = ""
$storageAccount = ""
$storageContainer = ""
$blobName = ""
$tempFolder = "D:\temp" 

$ScriptFullPath, $ScriptRoot = @('', '') 
$ScriptFullPath = if (-not [String]::IsNullOrEmpty($PSCommandPath)) { $PSCommandPath } elseif ($psEditor -ne $null) { $psEditor.GetEditorContext().CurrentFile.Path } elseif ($psise -ne $null) { $psise.CurrentFile.FullPath }; 
$ScriptRoot = Split-Path -Path $ScriptFullPath -Parent;
. "$ScriptRoot\spotlight.ps1"

$storageKey = (Get-AzStorageAccountKey -ResourceGroupName $storageRG -AccountName $storageAccount) | Where-Object { $_.KeyName -eq "key1" }
$ctx = New-AzStorageContext -StorageAccountName $storageAccount -StorageAccountKey $storageKey.Value

$null = Get-AzStorageBlobContent -Context $ctx -Container $storageContainer -Blob $blobName -Destination $tempFolder -Force

$tfStateString = Get-Content "$tempFolder\$blobName" -Raw

$graph = Get-GraphDataFromTFState -State $tfStateString
$graph | ConvertTo-Json | Set-Clipboard
