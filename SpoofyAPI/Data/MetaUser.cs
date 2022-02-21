using SpotifyAPI.Web;

namespace SpoofyAPI.Data {
    public class MetaUser {
        public string DisplayName { get; set; }
        public string UserId { get; set; }

        public MetaUser(PrivateUser user) { 
            this.DisplayName = user.DisplayName;
            this.UserId = user.Id;
        }
    }
}
