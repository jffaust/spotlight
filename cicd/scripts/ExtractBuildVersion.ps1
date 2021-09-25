$formattedVersion = "0.0.0"
if ($ENV:BUILD_BUILDNUMBER -match "(?<version>\d+\.\d+\.\d+\.\d+)") {
    $formattedVersion = $Matches.version
}
Write-Host "##vso[task.setvariable variable=BuildVersion]$formattedVersion"