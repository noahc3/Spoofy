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
        public RedirectResult Login([FromServices] IConfiguration configuration, [FromQuery] string redirect_uri) {
            var loginRequest = new LoginRequest(
                new Uri($"http://localhost:5003/authentication/callback"), //TODO: dynamically generate this
                configuration["Spotify:ClientID"],
                LoginRequest.ResponseType.Code
            ) {
                Scope = _scopes,
                State = redirect_uri.Base64Encode()
            };

            var uri = loginRequest.ToUri();

            return Redirect(uri.ToString());
        }

        [HttpGet("callback")]
        public async Task<RedirectResult> Callback([FromServices] IConfiguration configuration, [FromQuery] string state, [FromQuery] string code) {
            var origin = state.Base64Decode();

            var response = await new OAuthClient().RequestToken(
                new AuthorizationCodeTokenRequest(
                    configuration["Spotify:ClientID"],
                    configuration["Spotify:ClientSecret"],
                    code,
                    new Uri($"http://localhost:5003/authentication/callback")
                )
            );

            if (origin.Contains('?')) origin += '&';
            else origin += '?';

            origin += $"access_token={response.AccessToken}&refresh_token={response.RefreshToken}";

            return Redirect(origin);
        }

        // Flowless login requires the client to handle the OAuth flow itself, including providing the client ID and secret.
        // Intended for use with Swagger.
        [HttpGet("loginflowless")]
        public RedirectResult LoginFlowless([FromQuery] string redirect_uri, [FromQuery] string client_id, [FromQuery] string state) {
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

        [HttpPost("tokenflowless")]
        public async Task<Dictionary<string, string>> TokenFlowless([FromForm] string redirect_uri, [FromForm] string client_id, [FromForm] string client_secret, [FromForm] string code) {
            var response = await new OAuthClient().RequestToken(
                new AuthorizationCodeTokenRequest(
                    client_id,
                    client_secret,
                    code,
                    new Uri(redirect_uri)
                )
            );

            return new Dictionary<string, string>() {
                ["access_token"] = JsonConvert.SerializeObject(response).Base64Encode()
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
