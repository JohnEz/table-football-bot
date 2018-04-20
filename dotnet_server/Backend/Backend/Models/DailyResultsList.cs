using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Backend.Models
{
    public class DailyResultsList
    {
        public string Date { get; set; }

        public List<ResultSummary> Results { get; set; }
    }
}
