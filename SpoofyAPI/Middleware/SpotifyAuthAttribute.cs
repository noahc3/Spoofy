namespace SpoofyAPI {

    [AttributeUsage(AttributeTargets.Method, Inherited = false, AllowMultiple = false)]
    public class SpotifyAuthAttribute : Attribute {
        public SpotifyAuthAttribute() {

        }
    }
}
