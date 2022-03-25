using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using SpoofyAPI.Data;
using SpotifyAPI.Web;
using System.Linq;

namespace SpoofyAPI.Controllers {
    [ApiController]
    [Route("authentication")]
    public class AuthenticationController : Controller {
        private static readonly string[] _scopes = new[] {
            Scopes.PlaylistModifyPrivate,
            Scopes.PlaylistReadPrivate,
            Scopes.PlaylistReadCollaborative,
            Scopes.PlaylistModifyPublic,
        };

        private readonly ILogger<AuthenticationController> _logger;

        public AuthenticationController(ILogger<AuthenticationController> logger) {
            _logger = logger;
        }

        [HttpGet("login")]
        public RedirectResult Login([FromServices] IConfiguration configuration, [FromQuery] string redirect_uri, [FromQuery] string state, [FromQuery] string? client_id = "") {
            // Inject our client keys if not specified
            if (string.IsNullOrWhiteSpace(client_id)) {
                client_id = configuration["Spotify:ClientId"];
            }

            var loginRequest = new LoginRequest(
                new Uri(redirect_uri),
                client_id,
                LoginRequest.ResponseType.Code
            ) {
                Scope = _scopes,
                State = state
            };

            var uri = loginRequest.ToUri();

            return Redirect(uri.ToString());
        }

        [HttpPost("token")]
        public async Task<Dictionary<string, string>> Token([FromServices] IConfiguration configuration, [FromForm] string redirect_uri, [FromForm] string code, [FromForm] string? client_id = "", [FromForm] string? client_secret = "") {
            // Inject our client keys if not specified
            if (string.IsNullOrWhiteSpace(client_id)) client_id = configuration["Spotify:ClientId"];
            if (string.IsNullOrWhiteSpace(client_secret)) client_secret = configuration["Spotify:ClientSecret"];

            var response = await new OAuthClient().RequestToken(
                new AuthorizationCodeTokenRequest(
                    client_id,
                    client_secret,
                    code,
                    new Uri(redirect_uri)
                )
            );

            // encrypt our auth data so only we can use it
            return new Dictionary<string, string>() {
                ["access_token"] = JsonConvert.SerializeObject(response).Encrypt(configuration["Spotify:AuthDataKey"])
            };
        }

        [SpotifyAuth]
        [HttpGet("profile")]
        public async Task<MetaUser> Profile() {
            var c = HttpContext.GetSpotifyClient();
            var user = await c.UserProfile.Current();

            return new MetaUser(user);
        }
    }
}
