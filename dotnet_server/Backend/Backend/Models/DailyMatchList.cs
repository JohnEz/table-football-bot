using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Backend.Models
{
    public class DailyMatchList
    {
        public string Date { get; set; }

        public List<Match> Results { get; set; }
    }
}
