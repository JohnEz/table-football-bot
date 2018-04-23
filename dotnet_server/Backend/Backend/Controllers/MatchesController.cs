using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Backend.Repository;
using Backend.Models;
using Newtonsoft.Json;
using Backend.Managers;
using Microsoft.AspNetCore.Cors;
using Newtonsoft.Json.Serialization;
using Newtonsoft.Json.Linq;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    public class MatchesController : Controller
    {
        private  readonly MatchesManager _matchesManager;

        public MatchesController(MatchesManager matchesManager)
        {
            _matchesManager = matchesManager;
        }

        // GET: api/matches
        [HttpGet]
        public Task<string> Get()
        {
            return _matchesManager.GetAllMatchess();
        }

        //GET: api/matches/knockouts
        [HttpGet("knockouts")]
        public Task<string> GetKnockout()
        {
            return _matchesManager.GetKnockoutMatches();
        }

        //GET: api/matches/schedule
        [HttpGet("schedule")]
        public Task<string> GetSchedule()
        {
            return _matchesManager.GetScheduledMatches();
        }

        // GET api/matches/id
        [HttpGet("{id}")]
        public Task<string> Get(string id)
        {
            return _matchesManager.GetMatchById(id);
        }

        // GET api/matches/upcoming/count
        [HttpGet("upcoming/{count}")]
        public Task<string> GetUpcomingMatches(string count)
        {
            return _matchesManager.GetUpcomingMatches(count);
        }

        // POST api/matches
        [HttpPost]
        public void Post([FromBody]Match value)
        {
            _matchesManager.AddMatch(value);
        }

        // POST api/matches/teams
        [HttpPost("teams")]
        public async void GetMatchesForTeams([FromBody]JObject data)
        {
            await _matchesManager.GetMatchesBetweenTeams(data["team1Id"].ToString(), data["team2Id"].ToString());
        }

        // PUT api/matches
        [HttpPut()]
        public void Put(MatchUpdate value)
        {
            _matchesManager.UpdateKnockoutMatch(value);
        }

        // DELETE api/matches/id
        // TO DO
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }
    }
}
