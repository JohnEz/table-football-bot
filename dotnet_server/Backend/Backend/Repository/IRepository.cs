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
        Int32 GetCount();
    }

    public interface IResultsRepository<T> : IRepository<T>
    {
        Task<IEnumerable<T>> GetOrderedResultsForCount(Int32 count);
    }

    public interface IMatchesRepository<T> : IRepository<T>
    {
        Task<IEnumerable<T>> GetOrderedMatches();
    }
}
