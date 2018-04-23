using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Backend.Repository;
using Backend.Models;
using Newtonsoft.Json;
using System.Diagnostics;
using Backend.Managers;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    public class ResultsController : Controller
    {
        private readonly ResultsManager _resultsManager;

        public ResultsController(ResultsManager resultsManager)
        {
            _resultsManager = resultsManager;
        }

        // GET: api/results
        [HttpGet]
        public Task<string> Get()
        {
            return _resultsManager.GetAllResults();
        }

        // GET api/results/id
        [HttpGet("{id}")]
        public Task<string> Get(string id)
        {
            return _resultsManager.GetResultById(id);
        }

        // GET api/results/table/{countString}
        [HttpGet("table/{countString}")]
        public Task<string> GetResultsForTable(string countString)
        {
            return _resultsManager.GetResultsList(countString);
        }

        // POST api/results
        [HttpPost]
        public void Post([FromBody]Result value)
        {
            _resultsManager.AddResult(value);
        }

        // PUT api/results/id
        // TO DO
        [HttpPut("{id}")]
        public void Put(int id, [FromBody]Result value)
        {

        }

        // DELETE api/results/id
        // TO DO
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }
    }
}
