using Microsoft.AspNetCore.Mvc;

namespace Spotlight.Website.Controllers
{
    public class ProbeController : Controller
    {
        public IActionResult Health()
        {
            //This is a test
            return Ok("App is running");
        }
    }
}
