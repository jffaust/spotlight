# Spotlight

Ad hoc graph visualizations

## Min requirements

Node v10+

## Getting started

### VS Code on Windows

1. `cd spotlight\website`
2. `npm install`
3. Hit F5

### PowerShell & Docker

1. `& .\spotlight\website\package\build-docker-v2.ps1`
2. Paste the command copied to your clipboard and execute it
3. `docker run -d -p 8080:80 --name myapp spotlightviz/spotlight`
4. Visit `localhost:8080`
