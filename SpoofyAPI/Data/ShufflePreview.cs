namespace SpoofyAPI.Data {
    public class ShufflePreview {
        public string playlistId { get; set; }
        public IList<MetaTrack> shuffledTracks { get; set; }
        public IList<int> positionDelta { get; set; }

        public ShufflePreview(string playlistId, IList<MetaTrack> shuffledTracks, IList<int> positionDelta) { 
            this.playlistId = playlistId;
            this.shuffledTracks = shuffledTracks;
            this.positionDelta = positionDelta;
        }

    }
}
