using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Backend.Models
{
    public class ResultsList
    {
        public List<DailyResultsList> Results { get; set; }

        public bool AtLimit { get; set; }
    }
}
