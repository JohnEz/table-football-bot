using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Backend.Models
{
    public class Result
    {
        [BsonId]
        [JsonIgnore]
        public ObjectId ResultId { get; set; }

        [JsonProperty(PropertyName = "_id")]
        public string Id { get; set; }

        [BsonElement("player1")]
        [JsonIgnore]
        public ObjectId Player1Id { get; set; }

        [BsonElement("player2")]
        [JsonIgnore]
        public ObjectId Player2Id { get; set; }

        public string Player1 { get; set; }

        public string Player2 { get; set; }

        [BsonElement("score1")]
        public Int32 Score1 { get; set; }

        [BsonElement("score2")]
        public Int32 Score2 { get; set; }

        [BsonElement("date")]
        public DateTime Date { get; set; }

        [BsonElement("knockout")]
        public Boolean? KnockOut { get; set; }
    }
}
