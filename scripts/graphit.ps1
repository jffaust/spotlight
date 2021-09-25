<# 
.SYNOPSIS
    Cmdlet used to extract graph data from a Terraform state JSON string
#>
function Get-GraphDataFromTFState {
    [CmdletBinding()]
    Param(
        [parameter(Mandatory = $true)]
        [String]$State  # Raw TF state JSON string
    )

    $tfState = $State | ConvertFrom-Json -Depth 100

    $graph = @{
        nodes = New-Object -TypeName "System.Collections.ArrayList"
        links = New-Object -TypeName "System.Collections.ArrayList"
    }

    $tmpNodes = @{}
    $tmpLinks = New-Object -TypeName "System.Collections.ArrayList"
    foreach ($resource in $tfState.resources) {
        
        $isModule = $resource.module ? $true : $false
        $module = $isModule ? "$($resource.module)." : ""

        $isData = $resource.mode -eq "data"
        $data = $isData ? "data." : ""

        foreach ($instance in $resource.instances) {
            $instanceId = $instance.attributes.id
            $resourceId = [string]::Format("{0}{1}{2}.{3}", $module, $data, $resource.type, $resource.name)

            if (-not ([string]::IsNullOrEmpty($instance.index_key))) {
                $resourceId = "$resourceId['$($instance.index_key)']"
            }
            
            $parsedResource = @{ 
                id     = $resourceId; 
                module = $isModule ? $resource.module : ""; 
                data   = $isData; 
                type   = $resource.type; 
                name   = $resource.name
            }
            if ($instanceId) { $parsedResource.instanceId = $instanceId }
            $tmpNodes.Add($resourceId, $parsedResource)

            foreach ($dependency in $instance.dependencies) {
                $null = $tmpLinks.Add(@{ source = $resourceId; tmpTarget = $dependency; })
            }
        }
    }

    #label = "depends on"
    $regex = '^(?<Module>\S*?)\.?(?<Data>data)?\.(?<ResourceType>\w+)\.(?<Name>\w+)$'
    foreach ($link in $tmpLinks) {
        if ($tmpNodes.ContainsKey($link.source) -and $link.tmpTarget -match $regex) {

            $tmpModule = $Matches.Module
            $tmpData = $Matches.Data ? $true : $false
            $tmpType = $Matches.ResourceType
            $tmpName = $Matches.Name

            $targetNode = $null 
            foreach ($key in $tmpNodes.Keys) {
                $n = $tmpNodes[$key]
                if ($n.module -eq $tmpModule -and $n.data -eq $tmpData -and
                    $n.type -eq $tmpType -and $n.name -eq $tmpName) {
                    $targetNode = $n
                    break 
                }
            }
            
            if ($targetNode) {
                $null = $graph.links.Add(@{ 
                        source = $link.source; 
                        target = $targetNode.id;
                        label  = "depends on"
                    })
            }
        }
    }

    $graph.nodes = $tmpNodes.Values

    return $graph
}