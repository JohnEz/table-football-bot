using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Backend.Models
{
    public class Match
    {
        [BsonId]
        [JsonIgnore]
        public ObjectId MatchId { get; set; }

        [JsonProperty(PropertyName = "_id")]
        public string Id { get; set; }

        [BsonElement("team1")]
        [JsonIgnore]
        public ObjectId Team1Id { get; set; }

        [BsonElement("team2")]
        [JsonIgnore]
        public ObjectId Team2Id { get; set; }

        public Player Team1 { get; set; }

        public Player Team2 { get; set; }

        [BsonElement("result")]
        [JsonIgnore]
        public ObjectId ResultId { get; set; }

        public Result Result { get; set; }

        public Int32 Winner { get; set; }

        [BsonElement("stage")]
        public Int32? Stage { get; set; }

        [BsonElement("matchNumber")]
        public Int32? MatchNumber { get; set; }

        [BsonElement("date")]
        public DateTime Date { get; set; }
    }
}
