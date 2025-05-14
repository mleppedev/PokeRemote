namespace PokeRemote.Server.Models
{
    public class SdpMessage
    {
        public string Type { get; set; } = string.Empty;
        public string Sdp { get; set; } = string.Empty;
    }

    public class IceMessage
    {
        public string Candidate { get; set; } = string.Empty;
        public string SdpMid { get; set; } = string.Empty;
        public int SdpMLineIndex { get; set; }
    }
}
