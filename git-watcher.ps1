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
        
        $changes = git diff --cached --name-status
        if ($changes) {
            $changeLines = $changes -split "`n" | Where-Object { $_.Trim() -ne '' }
            if ($changeLines.Count -gt 0) {
                $firstChange = $changeLines[0]
                $status = $firstChange[0]
                $file = $firstChange.Substring(1).Trim()
                
                $type = "chore"
                if ($file -match "test") { $type = "test" }
                elseif ($file -match "\.(js|ts|py|cs|html|jsx|tsx)$") { $type = "feat" }
                elseif ($file -match "\.(css|scss|less)$") { $type = "style" }
                elseif ($file -match "README|docs") { $type = "docs" }

                $action = if ($status -eq 'A') { "add" } elseif ($status -eq 'D') { "remove" } else { "update" }
                $basename = Split-Path $file -Leaf
                
                $msg = "${type}: $action $basename"
                
                if ($changeLines.Count -gt 1) {
                    $msg += " and $( $changeLines.Count - 1 ) other files"
                }
                
                # Commit autonomously
                git commit -m $msg
            }
        }
        
        Pop-Location
    }
}
