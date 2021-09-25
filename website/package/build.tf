variable "ado_project_id" {
  type = string
}

variable "ado_build_pipelines_path" {
  type = string
}

variable "git_default_branch" {
  type = string
}

variable "github_repo_id" {
  type = string
}

variable "github_service_connection_id" {
  type = string
}

resource "azuredevops_build_definition" "build" {
  project_id      = var.ado_project_id
  agent_pool_name = "Azure Pipelines"
  name            = "Website"
  path            = var.ado_build_pipelines_path

  ci_trigger {
    use_yaml = true
  }

  repository {
    repo_type             = "GitHub"
    repo_id               = var.github_repo_id
    branch_name           = var.git_default_branch
    yml_path              = "website/package/build.yml"
    service_connection_id = var.github_service_connection_id
  }
}

output "pipeline_id" {
  value = azuredevops_build_definition.build.id
}
