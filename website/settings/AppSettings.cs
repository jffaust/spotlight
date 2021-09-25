using System;

namespace Spotlight.Website
{
    public class AppSettings
    {
        public string DefaultNodeColor { get; init; }
        public string AzureStorageConnectionString { get; init; }
        public bool StorageEnabled { get { return !String.IsNullOrEmpty(AzureStorageConnectionString); } }
    }
}
