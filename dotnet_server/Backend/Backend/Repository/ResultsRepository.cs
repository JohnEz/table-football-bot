using Microsoft.Extensions.Options;
using MongoDB.Driver;
using Backend.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MongoDB.Bson;

namespace Backend.Repository
{
    public class ResultsRepository : IResultsRepository<Result>
    {
        private readonly ResultsContext _context;

        public ResultsRepository(IOptions<Settings> settings)
        {
            _context = new ResultsContext(settings);
        }

        public async Task<IEnumerable<Result>> GetAll()
        {
            try
            {
                return await _context.Results
                        .Find(_ => true).ToListAsync();
            }
            catch (Exception ex)
            {
                // log or manage the exception
                throw ex;
            }
        }

        public Int32 GetCount ()
        {
            return (int)_context.Results.Count(_ => true);
        }

        public async Task<IEnumerable<Result>> GetOrderedResultsForCount(Int32 count)
        {
            try
            {
                return await _context.Results
                    .Find(_ => true)
                    .Sort("{date:-1}")
                    .Limit(count)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                // log or manage the exception
                throw ex;
            }
        }

        public async Task<Result> GetById(string id)
        {
            var filter = Builders<Result>.Filter.Eq("Id", id);

            try
            {
                return await _context.Results
                                .Find(filter)
                                .FirstOrDefaultAsync();
            }
            catch (Exception ex)
            {
                // log or manage the exception
                throw ex;
            }
        }

        public async Task AddNew(Result result)
        {
            try
            {
                await _context.Results.InsertOneAsync(result);
            }
            catch (Exception ex)
            {
                // log or manage the exception
                throw ex;
            }
        }
    }
}
