using SpotifyAPI.Web;

namespace SpoofyAPI.Data {
    public class MetaPlaylist {
        public string Id { get; set; } = "";
        public string Name { get; set; } = "";
        public string Description { get; set; } = "";
        public string PlaylistUrl { get; set; } = "";
        public string ImageUrl { get; set; } = "";
        public IList<MetaTrack> tracks { get; set; } = new List<MetaTrack>();
       
        public MetaPlaylist(SimplePlaylist sp) {
            this.Id = sp.Id;
            this.Name = sp.Name;
            this.Description = sp.Description;
            this.PlaylistUrl = sp.ExternalUrls["spotify"];
            this.ImageUrl = sp.Images.First().Url;
        }

        public MetaPlaylist(FullPlaylist fp) {
            this.Id = fp.Id!;
            this.Name = fp.Name!;
            this.Description = fp.Description!;
            this.PlaylistUrl = fp.ExternalUrls!["spotify"];
            this.ImageUrl = fp.Images!.First().Url;
        }

        public void PopulateTracks(IList<PlaylistTrack<IPlayableItem>> trackList) {
            this.tracks = new List<MetaTrack>();
            foreach (PlaylistTrack<IPlayableItem> track in trackList) {
                this.tracks.Add(new MetaTrack(track));
            }
        }

        public IList<MetaTrack> GetShuffle(ShuffleType type) {
            switch (type) {
                case ShuffleType.FullRandom:
                    return FullRandom();
                case ShuffleType.ArtistSpread:
                    return ArtistSpread();
                default:
                    return tracks;
            }
        }

        public IList<MetaTrack> FullRandom() {
            MetaTrack[] arr = new MetaTrack[this.tracks.Count];
            List<int> positions = Enumerable.Range(0, arr.Length).ToList(); //Unfilled indices left in the playlist

            foreach (MetaTrack t in this.tracks) {
                int pos = positions.ElementAt(Random.Shared.Next(0, positions.Count));
                arr[pos] = t;
                positions.Remove(pos);
            }

            return arr.ToList();
        }

        public IList<MetaTrack> ArtistSpread() {
            MetaTrack[] arr = new MetaTrack[this.tracks.Count];
            List<int> positions = Enumerable.Range(0, arr.Length).ToList(); //Unfilled indices left in the playlist

            var groupedTracks = this.tracks.GroupBy(x => x.artist);
            groupedTracks = groupedTracks.OrderByDescending(x => x.Count());

            foreach (IGrouping<string, MetaTrack> group in groupedTracks) {
                int numSectors = group.Count();
                double sectorSize = positions.Count() / numSectors;
                List<int> sectorPositions = new List<int>();

                for (int i = 0; i < numSectors; i++) {
                    int sectorStart = (int)Math.Floor(i * sectorSize);
                    int offset = Random.Shared.Next(0, (int) Math.Floor(sectorSize));
                    sectorPositions.Add(positions.ElementAt(sectorStart + offset));
                }

                foreach(MetaTrack t in group) {
                    int pos = sectorPositions.ElementAt(Random.Shared.Next(0, sectorPositions.Count()));
                    arr[pos] = t;
                    positions.Remove(pos);
                    sectorPositions.Remove(pos);
                }
            }

            return arr.ToList();
        }

        public enum ShuffleType {
            FullRandom = 0,
            ArtistSpread = 1
        }
    }
}
