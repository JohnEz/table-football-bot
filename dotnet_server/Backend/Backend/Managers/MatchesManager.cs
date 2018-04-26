using Backend.Models;
using Backend.Repository;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Backend.Managers
{
    public class MatchesManager
    {
        private readonly IResultsRepository<Result> _resultsRepository;
        private readonly IPlayersRepository<Player> _playersRepository;
        private readonly IMatchesRepository<Match> _matchesRepository;
        private readonly PlayersManager _playersManager;
        private readonly ResultsManager _resultsManager;

        public MatchesManager(IResultsRepository<Result> resultsRepository, IPlayersRepository<Player> playersRepository, IMatchesRepository<Match> matchesRepository, PlayersManager playersManager, ResultsManager resultsManager)
        {
            _resultsRepository = resultsRepository;
            _playersRepository = playersRepository;
            _matchesRepository = matchesRepository;
            _resultsManager = resultsManager;
            _playersManager = playersManager;
        }

        public async Task<string> GetAllMatchess()
        {
            IEnumerable<Match> matches = await _matchesRepository.GetAll();
            return JsonConvert.SerializeObject(matches);
        }

        public async Task<string> GetMatchById(string id)
        {
            Match match = await _matchesRepository.GetById(id) ?? new Match();
            return JsonConvert.SerializeObject(match);
        }

        public void AddMatch(Match value)
        {
            _matchesRepository.AddNew(new Match()
            {
                Team1Id = value.Team1Id,
                Team2Id = value.Team2Id,
                MatchNumber = value.MatchNumber,
                ResultId = value.ResultId,
                Stage = value.Stage,
                Date = value.Date
            });
        }

        public async Task<string> GetKnockoutMatches ()
        {
            Knockout knockoutMatches = await GetBracketMatches();
            return JsonConvert.SerializeObject(knockoutMatches);
        }

        public async Task<string> GetUpcomingMatches (string countString)
        {
            if (Int32.TryParse(countString, out Int32 count))
            {
                return await ConstructUpcomingMatches(count);
            }
            return await ConstructUpcomingMatches(0);
        }

        public async Task<string> GetScheduledMatches()
        {
            return await ConstructScheduledMatches();
        }

        public async Task<string> GetMatchesBetweenTeams(string team1Id, string team2Id)
        { 
            IEnumerable<Match> matches = await _matchesRepository.GetAll();
            IEnumerable<Match> enrichedMatches = await EnrichMatchesFromDatabase(matches);
            IEnumerable<Match> filteredMatches = enrichedMatches.Where(match => match.Team1Id.ToString() == team1Id || 
                match.Team2Id.ToString() == team1Id || 
                match.Team1Id.ToString() == team2Id || 
                match.Team2Id.ToString() == team2Id);
            return JsonConvert.SerializeObject(filteredMatches);
        }

        public async void UpdateKnockoutMatch(MatchUpdate matchUpdate)
        {
            Match matchToUpdate = await _matchesRepository.GetMatchByMatchNumber(matchUpdate.TargetMatchNumber);
            if(matchToUpdate.Stage != matchUpdate.TargetStage)
            {
                throw new Exception("match stages don't match");
            }
            matchToUpdate.Winner = matchUpdate.Winner;
            // TODO why need IsFirstTeam?
            _matchesRepository.Update(matchToUpdate, matchUpdate.TargetMatchNumber);
        }

        public async Task<IEnumerable<Match>> EnrichMatchesFromDatabase(IEnumerable<Match> matches)
        {
            IEnumerable<Result> results = await _resultsRepository.GetAll();
            IEnumerable<Result> enrichedResults = await _resultsManager.EnrichResultsFromDatabase(results);
            IEnumerable<Player> players = await _playersRepository.GetAll();
            foreach (Match match in matches)
            {
                match.Id = match.MatchId.ToString();
                string resultId = match.ResultId.ToString();
                string team1Id = match.Team1Id.ToString();
                string team2Id = match.Team2Id.ToString();
                match.Result = results.Where(result => result.ResultId.ToString() == resultId).Single();
                match.Team1 = _playersManager.EnrichPlayerFromDatabase(players.Where(player => player.PlayerId.ToString() == team1Id).Single());
                match.Team2 = _playersManager.EnrichPlayerFromDatabase(players.Where(player => player.PlayerId.ToString() == team2Id).Single());
            }
            return matches;
        }

        private async Task<Knockout> GetBracketMatches()
        {
            IEnumerable<Match> matches = await _matchesRepository.GetAll();
            IEnumerable<Match> enrichedMatches = await EnrichMatchesFromDatabase(matches);
            Knockout knockout = new Knockout
            {
                Prelims = new List<Match> { },
                SemiFinals = new List<Match> { },
                QuarterFinals = new List<Match> { },
                Finals = new List<Match> { }
            };

            foreach(Match match in matches)
            {
                Int32 winner = 0;
                if (match.Result.Score1 > match.Result.Score2)
                {
                    winner = 1;
                }
                else if (match.Result.Score1 < match.Result.Score2)
                {
                    winner = 2;
                }
                match.Winner = winner;

                switch (match.Stage)
                {
                    case 16:
                        knockout.Prelims.Add(match);
                        break;
                    case 8:
                        knockout.QuarterFinals.Add(match);
                        break;
                    case 4:
                        knockout.SemiFinals.Add(match);
                        break;
                    case 2:
                        knockout.Finals.Add(match);
                        break;
                };
            }

            return knockout;
        }

        private async Task<string> ConstructScheduledMatches()
        {
            bool gameFound = false;
            bool playedGameFound = false;
            IEnumerable<Match> orderedMatches = await _matchesRepository.GetOrderedMatches();
            if (orderedMatches.Count() > 0)
            {
                playedGameFound = true;
            }

            if (orderedMatches.Where(match => match.Result != null).Count() != 0) {
                gameFound = true;
            }

            IEnumerable<Match> todaysMatches = orderedMatches.Where(match => DateTime.Compare(match.Date.Date, DateTime.Now.Date) == 0)
                .Where(match => match.Result != null);
            IEnumerable<Match> overdueMatches = orderedMatches.Where(match => DateTime.Compare(match.Date, DateTime.Now) < 0)
                .Where(match => match.Result != null);

            List<Match> upcomingList = new List<Match>();
            List<Match> todayList = new List<Match>();
            List<Match> overdueList = new List<Match>();

            Int32 matchCount = todaysMatches.Count() + overdueMatches.Count();
            IEnumerable<Match> restrictedMatches;

            // Only want to construct any upcoming games if the overdue and todays games are < 8
            if (matchCount < 8)
            {
                Int32 count = 8 - matchCount;
                IEnumerable<Match> upcomingMatches = orderedMatches.Where(match => DateTime.Compare(match.Date, DateTime.Now) > 0);
                restrictedMatches = upcomingMatches.Take(count);
                IEnumerable<Match> enrichedUpcomingMatches = await EnrichMatchesFromDatabase(restrictedMatches);

                foreach (Match match in enrichedUpcomingMatches)
                {
                    overdueList.Add(match);
                }
            }

            IEnumerable<Match> enrichedTodaysMatches = await EnrichMatchesFromDatabase(todaysMatches);
            IEnumerable<Match> enrichedOverdueMatches = await EnrichMatchesFromDatabase(overdueMatches);

            foreach (Match match in enrichedTodaysMatches)
            {
                todayList.Add(match);
            }

            foreach (Match match in enrichedOverdueMatches)
            {
                overdueList.Add(match);
            }

            MatchesList matchesList = new MatchesList()
            {
                AtLimit = orderedMatches.Count() == (enrichedTodaysMatches.Count() + enrichedOverdueMatches.Count()),
                Upcoming = upcomingList,
                Today = todayList,
                Overdue = overdueList
            };

            if (!gameFound)
            {
                if(!playedGameFound)
                {
                    matchesList.message = Constants.Prompts.noGames;
                }
                else
                {
                    matchesList.message = Constants.Prompts.noGamesToPlay;
                }
            }

            return JsonConvert.SerializeObject(matchesList);
        }

        private async Task<string> ConstructUpcomingMatches(Int32 count)
        {
            count = count * 2;
            // get ordered matches, filter them, limit them, enrich them
            IEnumerable<Match> orderedMatches = await _matchesRepository.GetOrderedMatches();
            IEnumerable<Match> upcomingMatches = orderedMatches.Where(match => DateTime.Compare(match.Date, DateTime.Now) > 0).Take(count);
            IEnumerable<Match> restrictedMatches = upcomingMatches.Take(count);
            IEnumerable<Match> enrichedMatches = await EnrichMatchesFromDatabase(restrictedMatches);

            List<Match> upcomingList = new List<Match>();

            foreach (Match match in enrichedMatches)
            {
                upcomingList.Add(match);
            }

            MatchesList matchesList = new MatchesList()
            {
                AtLimit = enrichedMatches.Count() == upcomingMatches.Count(),
                Upcoming = upcomingList,
                Today = new List<Match>(),
                Overdue = new List<Match>()
            };

            return JsonConvert.SerializeObject(matchesList);
        }
    }
}
