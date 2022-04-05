using Newtonsoft.Json;
using SpotifyAPI.Web;

namespace SpoofyAPI {
    public static class Extensions {
        public static string Base64Encode(this string plaintext) {
            var plainTextBytes = System.Text.Encoding.UTF8.GetBytes(plaintext);
            return System.Convert.ToBase64String(plainTextBytes);
        }

        public static string Base64Decode(this string enctext) {
            var base64EncodedBytes = System.Convert.FromBase64String(enctext);
            return System.Text.Encoding.UTF8.GetString(base64EncodedBytes);
        }

        public static T DeserializeFromJson<T>(this string json) {
            return JsonConvert.DeserializeObject<T>(json)!;
        }

        public static SpotifyClient GetSpotifyClient(this HttpContext context) {
            return context.Items["SpotifyClient"] as SpotifyClient;
        }

        public static void SetSpotifyClient(this HttpContext context, SpotifyClient spotifyClient) {
            context.Items["SpotifyClient"] = spotifyClient;
        }

        //Get a sequence of indexes to move to end of source to replicate dest
        //Returns empty list if source and dest do not contain exactly the same items (by reference)
        public static IList<int> PositionDelta<T>(this IList<T> source, IList<T> dest) {
            List<int> delta = new List<int>();
            List<T> src = source.ToList(); // Copy source so we don't alter it

            // Validation: Lists should be the same size if they contain the same items
            if (src.Count != dest.Count) return delta;

            foreach(T k in dest) {
                int pos = src.IndexOf(k);

                //Validation: If item in dest is not in src, return blank delta.
                if (pos == -1) return new List<int>();

                delta.Add(pos);
                src.RemoveAt(pos);
                src.Add(k);
            }

            return delta;
        }
    }
}
