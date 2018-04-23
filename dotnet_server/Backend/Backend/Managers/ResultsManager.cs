using Backend.Models;
using Backend.Repository;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;

namespace Backend.Managers
{
    public class ResultsManager
    {
        private readonly IPlayersRepository<Player> _playersRepository;
        private readonly IResultsRepository<Result> _resultsRepository;

        public ResultsManager(IPlayersRepository<Player> playersRepository, IResultsRepository<Result> resultsRepository)
        {
            _playersRepository = playersRepository;
            _resultsRepository = resultsRepository;
        }

        public async Task<string> GetAllResults()
        {
            var results = await _resultsRepository.GetAll();
            return JsonConvert.SerializeObject(results);
        }

        public async Task<string> GetResultById(string id)
        {
            var result = await _resultsRepository.GetById(id) ?? new Result();
            return JsonConvert.SerializeObject(result);
        }

        public async Task<string> GetResultsList(string countString)
        {
            Int32 count = 0;
            if (Int32.TryParse(countString, out count))
            {
                return await ConstructResultsList(count);
            }
            return await ConstructResultsList(0);
        }

        public void AddResult(Result value)
        {
            _resultsRepository.AddNew(new Result()
            {
                Player1Id = value.Player1Id,
                Player2Id = value.Player2Id,
                Score1 = value.Score1,
                Score2 = value.Score2,
                Date = value.Date,
                KnockOut = value.KnockOut
            });
        }

        public async Task<IEnumerable<Result>> EnrichResultsFromDatabase(IEnumerable<Result> results)
        {
            var players = await _playersRepository.GetAll();
            foreach (Result result in results)
            {
                result.Id = result.ResultId.ToString();
                string player1Id = result.Player1Id.ToString();
                string player2Id = result.Player2Id.ToString();
                result.Player1 = player1Id;
                result.Player2 = player2Id;
            }
            return results;
        }

        private async Task<string> ConstructResultsList(Int32 count)
        {
            if (count == 0 || count > Constants.MaxResults.maxResults)
            {
                count = Constants.MaxResults.maxResults;
            }
            count = count * 10;
            var players = await _playersRepository.GetAll();
            var results = await _resultsRepository.GetOrderedResultsForCount(count);
            var resultsList = new ResultsList()
            {
                AtLimit = results.Count() == _resultsRepository.GetCount(),
                Results = new List<DailyResultsList>()
            };
            foreach (Result result in results)
            {
                // Create the summary of information needed by client
                ResultSummary resultSummary = new ResultSummary()
                {
                    Id = result.ResultId.ToString(),
                    Player1 = players.First(player => player.PlayerId == result.Player1Id).Country,
                    Player2 = players.First(player => player.PlayerId == result.Player2Id).Country,
                    Score1 = result.Score1,
                    Score2 = result.Score2
                };
                var resultDate = result.Date.ToString("yyyy-MM-dd");
                // if the current results date is already collected once in the list
                if(resultsList.Results.Exists(dailyList => dailyList.Date == resultDate))
                {
                    // get that particular result list and add a new result summary to it
                    resultsList.Results.Find(dailyList => dailyList.Date == resultDate).Results.Add(resultSummary);
                }
                else
                {
                    List<ResultSummary> summaryResultsList = new List<ResultSummary>();
                    summaryResultsList.Add(resultSummary);
                    DailyResultsList dailyResultsList = new DailyResultsList()
                    {
                        Date = resultDate,
                        Results = summaryResultsList
                    };
                    resultsList.Results.Add(dailyResultsList);
                }
            }

            return JsonConvert.SerializeObject(resultsList);
        }
    }
}
