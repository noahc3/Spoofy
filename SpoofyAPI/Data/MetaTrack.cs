using SpotifyAPI.Web;

namespace SpoofyAPI.Data {
    public class MetaTrack {
        public PlaylistTrack<IPlayableItem> item;
        public string id { get; set; } = "";
        public string title { get; set; } = "";
        public string artist { get; set; } = "";
        public string imageUrl { get; set; } = "";

        public MetaTrack(PlaylistTrack<IPlayableItem> item) {
            this.item = item;

            if (this.item.Track is FullTrack) {
                var track = (FullTrack) this.item.Track;
                this.id = track.Id;
                this.title = track.Name;
                this.artist = track.Artists.FirstOrDefault()?.Name ?? "";
                this.imageUrl = track.Album.Images.First().Url;
            } else if (this.item.Track is FullEpisode) {
                var track = (FullEpisode) this.item.Track;
                this.id = track.Id;
                this.title = track.Name;
                this.artist = track.Show.Publisher;
                this.imageUrl = track.Show.Images.First().Url;
            }
        }
    }
}
