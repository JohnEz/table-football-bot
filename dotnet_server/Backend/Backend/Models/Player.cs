using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using Newtonsoft.Json;
using System;

namespace Backend.Models
{
    public class Player
    {
        [BsonId]
        [JsonIgnore]
        public ObjectId PlayerId { get; set; }

        [JsonProperty(PropertyName = "_id")]
        public string Id { get; set; }

        [BsonElement("country")]
        public string Country { get; set; }

        [BsonElement("slackID")]
        [JsonProperty(PropertyName = "slackID")]
        public string SlackId { get; set; }

        [BsonElement("group")]
        public string Group { get; set; }

        [BsonElement("slackCode")]
        public string SlackCode { get; set; }

        [BsonElement("fname")]
        [JsonProperty(PropertyName = "fname")]
        public string FirstName { get; set; }

        public Int32? Against { get; set; }

        public Int32? For { get; set; }

        public Int32? Won { get; set; }

        public Int32? Draw { get; set; }

        public Int32? Lost { get; set; }
    }
}
