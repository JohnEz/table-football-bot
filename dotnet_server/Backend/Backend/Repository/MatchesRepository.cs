using Microsoft.Extensions.Options;
using MongoDB.Driver;
using Backend.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Backend.Repository
{
    public class MatchesRepository : IMatchesRepository<Match>
    {
        private readonly MatchContext _context = null;

        public MatchesRepository(IOptions<Settings> settings)
        {
            _context = new MatchContext(settings);
        }

        public async Task<IEnumerable<Match>> GetOrderedMatches()
        {
            try
            {
                return await _context.Matches
                        .Find(_ => true)
                        .Sort("{date:-1}")
                        .ToListAsync();
            }
            catch (Exception ex)
            {
                // log or manage the exception
                throw ex;
            }
        }

        public Int32 GetCount()
        {
            return (int)_context.Matches.Count(_ => true);
        }

        public async Task<Match> GetMatchByMatchNumber(Int32 matchNumber)
        {
            var filter = Builders<Match>.Filter.Eq("MatchNumber", matchNumber);

            try
            {
                return await _context.Matches
                                .Find(filter)
                                .FirstOrDefaultAsync();
            }
            catch (Exception ex)
            {
                // log or manage the exception
                throw ex;
            }
        }

        public async Task<IEnumerable<Match>> GetAll()
        {
            try
            {
                return await _context.Matches
                        .Find(_ => true).ToListAsync();
            }
            catch (Exception ex)
            {
                // log or manage the exception
                throw ex;
            }
        }

        public async Task<Match> GetById(string id)
        {
            var filter = Builders<Match>.Filter.Eq("Id", id);

            try
            {
                return await _context.Matches
                                .Find(filter)
                                .FirstOrDefaultAsync();
            }
            catch (Exception ex)
            {
                // log or manage the exception
                throw ex;
            }
        }

        public async Task AddNew(Match match)
        {
            try
            {
                await _context.Matches.InsertOneAsync(match);
            }
            catch (Exception ex)
            {
                // log or manage the exception
                throw ex;
            }
        }

        public void Update(Match match, Int32 matchNumber)
        {
            var filter = Builders<Match>.Filter.Eq("MatchNumber", matchNumber);
            var update = Builders<Match>.Update.Set("Winner", match.Winner);
            var updateOptions = new UpdateOptions
            {
                IsUpsert = true
            };

            try
            {
                _context.Matches.UpdateOne(filter, update, updateOptions);
            }
            catch (Exception ex)
            {
                // log or manage the exception
                throw ex;
            }
        }
    }
}
