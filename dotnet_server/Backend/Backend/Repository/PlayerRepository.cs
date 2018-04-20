using Microsoft.Extensions.Options;
using MongoDB.Driver;
using Backend.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Backend.Repository
{
    public class PlayerRepository : IRepository<Player>
    {
        private readonly PlayersContext _context;

        public PlayerRepository(IOptions<Settings> settings)
        {
            _context = new PlayersContext(settings);
        }

        public async Task<IEnumerable<Player>> GetAll()
        {
            try
            {
                return await _context.Players
                        .Find(_ => true).ToListAsync();
            }
            catch (Exception ex)
            {
                // log or manage the exception
                throw ex;
            }
        }

        public Int32 GetCount()
        {
            return (int)_context.Players.Count(_ => true);
        }

        public async Task<Player> GetById(string id)
        {
            var filter = Builders<Player>.Filter.Eq("Id", id);

            try
            {
                return await _context.Players
                                .Find(filter)
                                .FirstOrDefaultAsync();
            }
            catch (Exception ex)
            {
                // log or manage the exception
                throw ex;
            }
        }

        public async Task AddNew(Player player)
        {
            try
            {
                await _context.Players.InsertOneAsync(player);
            }
            catch (Exception ex)
            {
                // log or manage the exception
                throw ex;
            }
        }
    }
}
