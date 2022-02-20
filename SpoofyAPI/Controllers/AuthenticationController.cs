using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Linq;

namespace SpoofyAPI.Controllers {
    [ApiController]
    [Route("authentication")]
    public class AuthenticationController : Controller {
        private readonly ILogger<AuthenticationController> _logger;

        public AuthenticationController(ILogger<AuthenticationController> logger) {
            _logger = logger;
        }

        [Authorize(Policy = "Spotify")]
        [HttpGet("login")]
        public ContentResult Login() {
            return new ContentResult {
                ContentType = "text/html",
                Content = "<body> <script type='text/javascript'> window.close(); </script> </body>"
            };
        }
    }
}
