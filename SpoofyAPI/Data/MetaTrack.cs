using SpotifyAPI.Web;

namespace SpoofyAPI.Data {
    public class MetaTrack {
        public PlaylistTrack<IPlayableItem> item;
        public string title { get; set; } = "";
        public string artist { get; set; } = "";

        public MetaTrack(PlaylistTrack<IPlayableItem> item) {
            this.item = item;

            if (this.item.Track is FullTrack) {
                var track = (FullTrack) this.item.Track;
                this.title = track.Name;
                this.artist = track.Artists.FirstOrDefault()?.Name ?? "";
            } else if (this.item.Track is FullEpisode) {
                var track = (FullEpisode) this.item.Track;
                this.title = track.Name;
                this.artist = track.Show.Publisher;
            }
        }
    }
}
