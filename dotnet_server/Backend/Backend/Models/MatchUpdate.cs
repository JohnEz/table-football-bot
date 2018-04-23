using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Backend.Models
{
    public class MatchUpdate
    {
        public Int32 Winner { get; set; }

        public Int32 TargetStage { get; set; }

        public Int32 TaregtMatchNumber { get; set; }

        public bool IsFirstTeam { get; set; }
    }
}
