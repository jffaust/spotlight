
function Get-FileSystemData($folder) {
    $null = $nodes.Add(@{ 
        id = $folder.fullname
        name = $folder.name
        type = "folder"
    })

    $children = Get-ChildItem $folder

    foreach ($item in $children) {
        $null = $links.Add(@{ 
            source = $folder.fullname
            target = $item.fullname
        })

        if ($item.PSIsContainer) {
            Get-FileSystemData $item
        } else {
            $null = $nodes.Add(@{ 
                id = $item.fullname
                name = $item.name
                type = "file"
            })
        }
    }
}

$repoRoot = (Get-Item .).parent

$nodes = New-Object -TypeName "System.Collections.ArrayList"
$links = New-Object -TypeName "System.Collections.ArrayList"

Get-FileSystemData -folder $repoRoot

$graphData = @{
    nodes = $nodes
    links = $links
}

$graphData | ConvertTo-Json | Set-Clipboard