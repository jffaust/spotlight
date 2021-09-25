namespace Spotlight.Website
{
    public class ClientAppSettings
    {
        public string DefaultNodeColor { get; set; }
        public bool StorageEnabled { get; set; }

        public ClientAppSettings(AppSettings from)
        {
            DefaultNodeColor = from.DefaultNodeColor;
            StorageEnabled = from.StorageEnabled;
        }
    }
}
