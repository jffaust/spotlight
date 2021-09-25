terraform {
  backend "azurerm" {
    resource_group_name  = ""
    storage_account_name = ""
    container_name       = ""
    key                  = ""
  }
}

provider "azuredevops" {
  version         = ">= 0.0.1"
  org_service_url = ""
  # To be able to use the Azure DevOps provider, you need to set the env variable "AZDO_PERSONAL_ACCESS_TOKEN" with your token
}

locals {
  ado_build_pipelines_path     = "\\Builds"
  git_default_branch           = "main"
  github_repo_id               = "jffaust/spotlight"
  github_service_connection_id = ""
}

resource "azuredevops_project" "spotlight" {
  name        = "Spotlight"
  description = "Ad hoc graph visualizations"

  features = {
    "boards"       = "disabled"
    "repositories" = "disabled"
    "testplans"    = "disabled"
  }
}

output "azuredevops_project_id" {
  value = azuredevops_project.spotlight.id
}

module "website" {
  source                       = "../../website/package"
  ado_project_id               = azuredevops_project.spotlight.id
  ado_build_pipelines_path     = local.ado_build_pipelines_path
  git_default_branch           = local.git_default_branch
  github_repo_id               = local.github_repo_id
  github_service_connection_id = local.github_service_connection_id
}

output "website_build_pipeline_id" {
  value = module.website.pipeline_id
}
