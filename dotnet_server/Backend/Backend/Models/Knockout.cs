using Backend.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Backend.Models
{
    public class Knockout
    {
        public List<Match> Prelims { get; set; }

        public List<Match> QuarterFinals { get; set; }

        public List<Match> SemiFinals { get; set; }

        public List<Match> Finals { get; set; }
    }
}
