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
    public class PlayersManager
    {
        private readonly IResultsRepository<Result> _resultsRepository;
        private readonly IPlayersRepository<Player> _playersRepository;
        private readonly ResultsManager _resultsManager;

        public PlayersManager(IResultsRepository<Result> resultsRepository, IPlayersRepository<Player> playersRepository, ResultsManager resultsManager)
        {
            _resultsRepository = resultsRepository;
            _resultsManager = resultsManager;
            _playersRepository = playersRepository;
        }

        public async Task<string> GetAllPlayers()
        {
            var players = await _playersRepository.GetAll();
            return JsonConvert.SerializeObject(players);
        }

        public async Task<string> GetPlayerById(string id)
        {
            var player = await _playersRepository.GetById(id) ?? new Player();
            return JsonConvert.SerializeObject(player);
        }

        public void AddPlayer(Player value)
        {
            _playersRepository.AddNew(new Player()
            {
                SlackCode = value.SlackCode,
                FirstName = value.FirstName,
                Group = value.Group,
                SlackId = value.SlackId,
                Country = value.Country
            });
        }

        public async Task<string> GetPlayerBySearchTerm(string searchTerm)
        {
            Player player = EnrichPlayerFromDatabase(await _playersRepository.GetPlayerWithSearchTerm(searchTerm));
            return JsonConvert.SerializeObject(player);
        }

        public async Task<string> GetLeaderboard()
        {
            var leaderboard = await GetPlayersForTables();
            return JsonConvert.SerializeObject(leaderboard);
        }

        public Player EnrichPlayerFromDatabase(Player player)
        {
            player.Id = player.PlayerId.ToString();
            // add initial values of 0 to players totals for leaderboard
            player.Against = 0;
            player.For = 0;
            player.Won = 0;
            player.Lost = 0;
            player.Draw = 0;
            return player;
        }

        private async Task<IEnumerable<Player>> GetPlayersForTables()
        {
            var players = await _playersRepository.GetAll();
            var results = await _resultsRepository.GetAll();
            var enrichedResults = await _resultsManager.EnrichResultsFromDatabase(results);
            List<Player> leagueList = new List<Player>();
            foreach(Player player in players)
            {
                Player enrichedPlayer = EnrichPlayerFromDatabase(player);
                foreach(Result result in enrichedResults)
                {
                    bool isGroupStage = !(result.KnockOut) ?? true;
                    if(isGroupStage)
                    {
                        if(result.Player1 == enrichedPlayer.Id)
                        {
                            enrichedPlayer.For = enrichedPlayer.For + result.Score1;
                            enrichedPlayer.Against = enrichedPlayer.Against + result.Score2;
                            if(result.Score1 > result.Score2)
                            {
                                enrichedPlayer.Won ++;
                            }
                            else if(result.Score1 < result.Score2)
                            {
                                enrichedPlayer.Lost ++;
                            } else
                            {
                                enrichedPlayer.Draw++;
                            }
                        }

                        if (result.Player2 == enrichedPlayer.Id)
                        {
                            enrichedPlayer.For = enrichedPlayer.For + result.Score2;
                            enrichedPlayer.Against = enrichedPlayer.Against + result.Score1;
                            if (result.Score2 > result.Score1)
                            {
                                enrichedPlayer.Won++;
                            }
                            else if (result.Score2 < result.Score1)
                            {
                                enrichedPlayer.Lost++;
                            }
                            else
                            {
                                enrichedPlayer.Draw++;
                            }
                        }
                    }
                }
                leagueList.Add(enrichedPlayer);
            }
            return leagueList.AsEnumerable();
        }
    }
}
