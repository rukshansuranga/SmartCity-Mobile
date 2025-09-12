# Create screenshots directory
New-Item -ItemType Directory -Force -Path "maestro\screenshots"

# Install Maestro CLI (Windows)
Write-Host "Installing Maestro CLI..."

# Download and install Maestro
$maestroUrl = "https://github.com/mobile-dev-inc/maestro/releases/latest/download/maestro-windows.zip"
$tempPath = "$env:TEMP\maestro-windows.zip"
$maestroPath = "$env:USERPROFILE\.maestro"

try {
    # Create maestro directory
    New-Item -ItemType Directory -Force -Path $maestroPath
    
    # Download Maestro
    Invoke-WebRequest -Uri $maestroUrl -OutFile $tempPath
    
    # Extract Maestro
    Expand-Archive -Path $tempPath -DestinationPath $maestroPath -Force
    
    # Add to PATH
    $currentPath = [Environment]::GetEnvironmentVariable("PATH", "User")
    $maestroBinPath = "$maestroPath\bin"
    
    if ($currentPath -notlike "*$maestroBinPath*") {
        [Environment]::SetEnvironmentVariable("PATH", "$currentPath;$maestroBinPath", "User")
        Write-Host "Added Maestro to PATH. Please restart your terminal."
    }
    
    Write-Host "Maestro installed successfully!"
    Write-Host "Restart your terminal and run 'maestro --version' to verify installation."
    
    # Clean up
    Remove-Item $tempPath -ErrorAction SilentlyContinue
    
} catch {
    Write-Error "Failed to install Maestro: $_"
}

Write-Host ""
Write-Host "To use Maestro with your SmartCity app:"
Write-Host "1. Start your app: npm run android"
Write-Host "2. Run smoke tests: npm run test:smoke"  
Write-Host "3. Run all tests: npm run test:maestro"
Write-Host ""
Write-Host "Test files are located in the maestro/ directory"