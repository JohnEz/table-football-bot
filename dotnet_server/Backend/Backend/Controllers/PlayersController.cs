using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Backend.Repository;
using Backend.Models;
using Newtonsoft.Json;
using Backend.Managers;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    public class PlayersController : Controller
    {
        private readonly PlayersManager _playersManager;

        public PlayersController(PlayersManager playersManager)
        {
            _playersManager = playersManager;
        }

        // GET: api/players
        [HttpGet]
        public Task<string> Get()
        {
            return _playersManager.GetAllPlayers();
        }

        //GET api/players/leaderboard
        [HttpGet("leaderboard")]
        public Task<string> GetLeaderboard()
        {
            return _playersManager.GetLeaderboard();
        }

        // GET api/players/id
        [HttpGet("{id}")]
        public Task<string> Get(string id)
        {
            return _playersManager.GetPlayerById(id);
        }

        // POST api/players
        [HttpPost]
        public void Post([FromBody]Player value)
        {
            _playersManager.AddPlayer(value);
        }

        // PUT api/players/id
        // TO DO
        [HttpPut("{id}")]
        public void Put(int id, [FromBody]Player value)
        {
        }

        // DELETE api/players/id
        // TO DO
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }
    }
}
