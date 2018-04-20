using Microsoft.Extensions.Options;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;

namespace Backend.Models
{
    public class ResultsContext
    {
        private readonly IMongoDatabase _database;

        public ResultsContext(IOptions<Settings> settings)
        {
            var address = new MongoUrl("mongodb://ds011462.mlab.com:11462");
            var fromUrl = MongoDB.Driver.MongoClientSettings.FromUrl(address);
            var credential = MongoCredential.CreateCredential(settings.Value.Database, "admin", "2604aj1010rb");
            fromUrl.Credential = credential;

            var client = new MongoClient(fromUrl);
            if (client != null)
                {
                _database = client.GetDatabase(settings.Value.Database);
            }
        }

        public IMongoCollection<Result> Results
        {
            get
            {
                return _database.GetCollection<Result>("results");
            }
        }
    }
}