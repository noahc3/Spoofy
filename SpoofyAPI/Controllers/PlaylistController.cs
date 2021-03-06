using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using SpoofyAPI.Data;
using SpotifyAPI.Web;

namespace SpoofyAPI.Controllers {
    [ApiController]
    [Route("playlist")]
    public class PlaylistController : ControllerBase {

        private readonly ILogger<PlaylistController> _logger;

        public PlaylistController(ILogger<PlaylistController> logger) {
            _logger = logger;
        }

        [SpotifyAuth]
        [HttpGet("getplaylists")]
        public async Task<IList<MetaPlaylist>> GetPlaylists() {
            var c = HttpContext.GetSpotifyClient();
            var page = await c.Playlists.CurrentUsers();
            var playlists = await c.PaginateAll(page);
            var parsedPlaylists = new List<MetaPlaylist>();

            foreach (SimplePlaylist p in playlists) {
                parsedPlaylists.Add(new MetaPlaylist(p));
            }

            Console.WriteLine((await c.UserProfile.Current()).DisplayName);

            return parsedPlaylists;
        }

        [SpotifyAuth]
        [HttpGet("shuffle")]
        public async Task<ShufflePreview> Shuffle([FromQuery] string playlistId, [FromQuery] MetaPlaylist.ShuffleType shuffleType, [FromQuery] bool preview) {
            var c = HttpContext.GetSpotifyClient();
            var playlist = await c.Playlists.Get(playlistId);
            var tracks = await c.PaginateAll(await c.Playlists.GetItems(playlistId));
            MetaPlaylist mp = new MetaPlaylist(playlist);

            mp.PopulateTracks(tracks);
            IList<MetaTrack> shuffle = mp.GetShuffle(shuffleType);

            var delta = mp.tracks.PositionDelta(shuffle);

            if (!preview) {
                foreach(int pos in delta) {
                    Console.WriteLine(pos);
                    PlaylistReorderItemsRequest r = new PlaylistReorderItemsRequest(pos, tracks.Count);
                    await c.Playlists.ReorderItems(mp.Id, r);
                }
            }

            return new ShufflePreview(mp.Id, shuffle, delta);
        }

        [SpotifyAuth]
        [HttpPost("applyshuffle")]
        public async Task<StatusCodeResult> ApplyShuffle([FromQuery] string playlistId, [FromBody] IList<int> delta) {
            var c = HttpContext.GetSpotifyClient();
            var tracks = await c.PaginateAll(await c.Playlists.GetItems(playlistId));

            foreach (int pos in delta) {
                Console.WriteLine(pos);
                PlaylistReorderItemsRequest r = new PlaylistReorderItemsRequest(pos, tracks.Count);
                await c.Playlists.ReorderItems(playlistId, r);
            }

            return Ok();
        }
    }
}