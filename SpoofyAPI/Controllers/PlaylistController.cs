using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace SpoofyAPI.Controllers {
    [ApiController]
    [Route("[controller]")]
    public class PlaylistController : ControllerBase {

        private readonly ILogger<PlaylistController> _logger;

        public PlaylistController(ILogger<PlaylistController> logger) {
            _logger = logger;
        }

        [Authorize(Policy = "Spotify")]
        [HttpGet(Name = "GetPlaylists")]
        public async Task<IEnumerable<string>> GetPlaylists([FromServices] SpotifyClientBuilder spotifyClientBuilder) {
            var c = await spotifyClientBuilder.BuildClient();
            var page = await c.Playlists.CurrentUsers();
            var playlists = await c.PaginateAll(page);

            return playlists.Select(x => x.Name);
        }
    }
}