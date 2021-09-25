locals {
  resource_group_name   = "spotlight-${lower(var.environment)}-rg${var.resource_index}"
  app_service_plan_name = "spotlight-${lower(var.environment)}-asp${var.resource_index}"
  website_app_name      = "spotlight-${lower(var.environment)}-app${var.resource_index}"
  storage_account_name  = "spotlight${lower(var.environment)}st${var.resource_index}"
}

resource "azurerm_resource_group" "website" {
  lifecycle {
    ignore_changes = [tags.CreationDate, tags.EndDate]
  }
  tags     = var.tags
  name     = local.resource_group_name
  location = var.region
}

resource "azurerm_app_service_plan" "website" {
  lifecycle {
    ignore_changes = [tags]
  }
  name                = local.app_service_plan_name
  resource_group_name = azurerm_resource_group.website.name
  location            = azurerm_resource_group.website.location
  kind                = "Linux"
  reserved            = true

  sku {
    tier = "Free"
    size = "F1"
  }
}

resource "azurerm_app_service" "website" {
  lifecycle {
    ignore_changes = [tags]
  }
  name                = local.website_app_name
  location            = azurerm_resource_group.website.location
  resource_group_name = azurerm_resource_group.website.name
  app_service_plan_id = azurerm_app_service_plan.website.id
  https_only          = true

  app_settings = {
    "DOCKER_REGISTRY_SERVER_URL"          = "https://index.docker.io"
    "DOCKER_REGISTRY_SERVER_PASSWORD"     = ""
    "DOCKER_REGISTRY_SERVER_USERNAME"     = ""
    "WEBSITES_ENABLE_APP_SERVICE_STORAGE" = "false"
    "GRAPHIT_AZURE_STORAGE_CONNECTION"    = var.enable_azure_storage ? azurerm_storage_account.spotlight[0].primary_connection_string : ""
  }
}

resource "azurerm_storage_account" "spotlight" {
  count                    = var.enable_azure_storage ? 1 : 0
  name                     = local.storage_account_name
  location                 = azurerm_resource_group.website.location
  resource_group_name      = azurerm_resource_group.website.name
  account_tier             = "Standard"
  account_replication_type = "LRS"
}

resource "azuredevops_build_definition" "deploy" {
  project_id      = var.ado_project_id
  agent_pool_name = "Azure Pipelines"
  name            = "${title(var.environment)}-Website"
  path            = var.ado_deployment_pipelines_path

  ci_trigger {
    use_yaml = true
  }

  repository {
    repo_type             = "GitHub"
    repo_id               = var.github_repo_id
    branch_name           = var.git_default_branch
    yml_path              = "cicd/deployments/deploy-web-app-container.yml"
    service_connection_id = var.github_service_connection_id
  }

  variable {
    name  = "buildId"
    value = "0" # Expected to be passed at queue time either manually or via a script (azdeploy)
  }
  variable {
    name  = "AzureDevOpsProjectId"
    value = var.ado_project_id
  }
  variable {
    name  = "BuildPipelineId"
    value = var.ado_build_pipeline_id
  }
  variable {
    name  = "AppEnvironment"
    value = title(var.environment)
  }
  # Name of the service connection in Azure DevOps that grants access to manage resources for a given subscription
  variable {
    name  = "AzureSubscriptionConnection"
    value = var.azure_subscription_connection
  }
  variable {
    name  = "ResourceGroup"
    value = azurerm_resource_group.website.name
  }
  variable {
    name  = "WebApp"
    value = local.website_app_name
  }

  variable {
    name  = "DockerRegistry"
    value = var.docker_registry
  }

  variable {
    name  = "DockerRepository"
    value = var.docker_repository
  }

  variable {
    name  = "DockerImageTag"
    value = "latest"
  }
}

