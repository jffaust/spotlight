terraform {
  backend "azurerm" {
    resource_group_name  = ""
    storage_account_name = ""
    container_name       = ""
    key                  = ""
  }
}

data "terraform_remote_state" "builds" {
  backend = "azurerm"

  config = {
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

provider "azurerm" {
  version = "=2.37.0"
  features {}
}

locals {
  environment                   = "dev"
  region                        = "eastus"
  ado_deployment_pipelines_path = "\\Deployments"
  git_default_branch            = "main"
  github_repo_id                = "jffaust/spotlight"
  github_service_connection_id  = ""
  azure_subscription_connection = "DevServiceConnection"
  Tags = {
    Example = "Spotlight"
  }
}

module "website" {
  source                        = "../../../website/deployment"
  environment                   = local.environment
  region                        = local.region
  ado_project_id                = data.terraform_remote_state.builds.outputs.azuredevops_project_id
  ado_deployment_pipelines_path = local.ado_deployment_pipelines_path
  ado_build_pipeline_id         = data.terraform_remote_state.builds.outputs.website_build_pipeline_id
  git_default_branch            = local.git_default_branch
  github_repo_id                = local.github_repo_id
  github_service_connection_id  = local.github_service_connection_id
  azure_subscription_connection = local.azure_subscription_connection
  enable_azure_storage          = true
  tags                          = local.Tags
}
