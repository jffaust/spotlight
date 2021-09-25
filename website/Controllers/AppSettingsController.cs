using Microsoft.AspNetCore.Mvc;

namespace Spotlight.Website.Controllers
{
    public class AppSettingsController : Controller
    {
        private readonly ClientAppSettings _settings;

        public AppSettingsController(ClientAppSettings settings)
        {
            _settings = settings;
        }

        [HttpGet]
        [Route("appSettings")]
        public IActionResult Get()
        {
            return Ok(_settings);
        }
    }
}
