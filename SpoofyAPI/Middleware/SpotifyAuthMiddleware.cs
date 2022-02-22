using Microsoft.AspNetCore.Http.Features;
using Microsoft.Net.Http.Headers;
using SpotifyAPI.Web;

namespace SpoofyAPI.Middleware {
    public class SpotifyAuthMiddleware {
        private RequestDelegate _next;

        public SpotifyAuthMiddleware(RequestDelegate next) {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context, IConfiguration configuration, SpotifyClientConfig spotifyClientConfig) {

            var endpoint = context.Features.Get<IEndpointFeature>()?.Endpoint;
            var attribute = endpoint?.Metadata.GetMetadata<SpotifyAuthAttribute>();

            if (attribute != null) {
                AuthorizationCodeTokenResponse resp =
                    context.Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "")
                    .Decrypt(configuration["Spotify:AuthDataKey"])
                    .DeserializeFromJson<AuthorizationCodeTokenResponse>();

                if (resp == null || resp.IsExpired) {
                    context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                    return;
                }

                var client = new SpotifyClient(spotifyClientConfig.WithToken(resp.AccessToken!));
                context.SetSpotifyClient(client);
            }

            await _next(context);
        }
    }
}
