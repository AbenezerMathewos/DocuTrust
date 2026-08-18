$folder = 'C:\INSA\DocuTrust'
$filter = '*.*'

$watcher = New-Object IO.FileSystemWatcher $folder, $filter -Property @{
    IncludeSubdirectories = $true
    EnableRaisingEvents = $true
}

$global:filesChanged = $false

$action = {
    $path = $Event.SourceEventArgs.FullPath
    # Ignore .git folder changes to prevent infinite loops when committing
    if ($path -notmatch '\\\.git\\') {
        Write-Output "FILE_CHANGED: $path"
        $global:filesChanged = $true
    }
}

Register-ObjectEvent $watcher 'Changed' -Action $action > $null
Register-ObjectEvent $watcher 'Created' -Action $action > $null
Register-ObjectEvent $watcher 'Deleted' -Action $action > $null
Register-ObjectEvent $watcher 'Renamed' -Action $action > $null

Write-Output "Git watcher daemon started. Autonomously committing in the muluwengel mezemran ken..."

while ($true) {
    Start-Sleep -Seconds 2
    if ($global:filesChanged) {
        $global:filesChanged = $false
        Write-Output "Changes detected. Automatically committing..."
        
        # Change to the target directory to ensure git commands run in the correct context
        Push-Location $folder
        
        # Add all changes including removed and new files
        git add -A
        
        # Commit autonomously
        git commit -m "Autocommit: muluwengel mezemran ken"
        
        Pop-Location
    }
}
