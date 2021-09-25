# Save current location
Push-Location $PSScriptRoot

# Go to the "website" folder
cd ..

# Build the image
docker build -t spotlightviz/spotlight:latest -f package/Dockerfile .

Set-Clipboard "docker run -d -p 8080:80 --name myapp spotlightviz/spotlight"
Write-Host "Command to run app in container copied to clipboard :)"

# Go back to location before script execution
Pop-Location