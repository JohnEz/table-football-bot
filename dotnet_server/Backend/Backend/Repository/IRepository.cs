using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MongoDB.Bson;

namespace Backend.Repository
{
    public interface IRepository<T>
    {
        Task<IEnumerable<T>> GetAll();
        Task<T> GetById(string id);
        Task AddNew(T item);
        void Update(T iteam, Int32 id);
        Int32 GetCount();
    }

    public interface IResultsRepository<Result> : IRepository<Result>
    {
        Task<IEnumerable<Result>> GetOrderedResultsForCount(Int32 count);
    }

    public interface IMatchesRepository<Match> : IRepository<Match>
    {
        Task<IEnumerable<Match>> GetOrderedMatches();
        Task<Match> GetMatchByMatchNumber(Int32 matchNumber);
    }

    public interface IPlayersRepository<Player> : IRepository<Player>
    {
        Task<Player> GetPlayerWithSearchTerm(string searchTerm);
    }
}
