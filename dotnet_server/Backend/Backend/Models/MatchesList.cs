using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Backend.Models
{
    public class MatchesList
    {
        public List<Match> Upcoming { get; set; }

        public List<Match> Today { get; set; }

        public List<Match> Overdue { get; set; }

        public bool AtLimit { get; set; }

        public string message { get; set; }
    }
}
