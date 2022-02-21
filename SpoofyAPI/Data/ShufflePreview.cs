namespace SpoofyAPI.Data {
    public class ShufflePreview {
        public IList<MetaTrack> shuffledTracks { get; set; }
        public IList<int> positionDelta { get; set; }

        public ShufflePreview(IList<MetaTrack> shuffledTracks, IList<int> positionDelta) { 
            this.shuffledTracks = shuffledTracks;
            this.positionDelta = positionDelta;
        }

    }
}
